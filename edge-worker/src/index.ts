import {
  isExperienceMatch,
  selectActiveExperiments,
  selectEligibleExperiences,
} from '@ninetailed/experience.js';
import { ContentfulClient } from './contentful';
import {
  buildNinetailedEdgeRequestContext,
  CachedFetcher,
  EXPERIENCE_TRAIT_PREFIX,
  fetchEdgeProfile,
  getVariantIndex,
  sendIdentify,
} from './utils';

type Cookies = {
  [key: string]: string;
};

type Env = {
  NINETAILED_API_KEY: string;
  NINETAILED_ENVIRONMENT: string;
};

type VariantSelection = {
  experienceId: string;
  variantIndex: number;
};

const getCookies = (request: Request): Cookies => {
  const cookieStr = request.headers.get('Cookie');

  if (!cookieStr) {
    return {};
  }

  const cookieEntries = cookieStr.split(';').map((cookie) => {
    return cookie.trim().split('=');
  });
  const cookies: Cookies = Object.fromEntries(cookieEntries);
  return cookies;
};

const getIP = (request: Request): string => {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  return ip;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext
  ): Promise<Response> {
    const acceptHeaders = request.headers.get('Accept') || '';
    if (!acceptHeaders.includes('text/html')) {
      return fetch(request);
    }

    const cachedFetcher = new CachedFetcher({
      context,
      defaultTtl: 5,
    });

    const contentfulClient = new ContentfulClient({
      cachedFetcher,
    });

    const slug = new URL(request.url).pathname;

    const fetchProfileOptions = {
      ctx: buildNinetailedEdgeRequestContext(request),
      clientId: env.NINETAILED_API_KEY,
      environment: env.NINETAILED_ENVIRONMENT,
      cookies: getCookies(request),
      ip: getIP(request),
      location: {
        city: request.cf?.city,
        region: request.cf?.region,
        country: request.cf?.country,
        continent: request.cf?.continent,
      },
    };

    const [{ profile, cache }, allExperiments, experiencesOnPage] =
      await Promise.all([
        fetchEdgeProfile(fetchProfileOptions),
        contentfulClient.getAllExperiments(),
        contentfulClient.getExperiencesOnPage(slug),
      ]);

    const joinedExperiments = selectActiveExperiments(allExperiments, profile);

    const eligibleExperiences = selectEligibleExperiences({
      experiences: experiencesOnPage,
      activeExperiments: joinedExperiments,
    });

    const matchingExperiences = eligibleExperiences.filter((experience) => {
      return isExperienceMatch({
        experience,
        activeExperiments: joinedExperiments,
        profile,
      });
    });

    const matchingPersonalizations = matchingExperiences.filter(
      (experience) => {
        return experience.type === 'nt_personalization';
      }
    );

    const firstExperiment = matchingExperiences.find((experience) => {
      return experience.type === 'nt_experiment';
    });

    // Join first experiment (if not in experiment already) and write to profile cache(cookie)
    if (!joinedExperiments.length && firstExperiment) {
      const traitKey = `${EXPERIENCE_TRAIT_PREFIX}${firstExperiment.id}`;
      cache.traits[traitKey] = true;
      context.waitUntil(
        sendIdentify({
          traits: { traitKey: true },
          ctx: buildNinetailedEdgeRequestContext(request),
          clientId: env.NINETAILED_API_KEY,
          environment: env.NINETAILED_ENVIRONMENT,
          cookies: getCookies(request),
        })
      );
    }

    // Get variant index for each matching personalization + first experiment
    const variantSelections: VariantSelection[] = [
      ...matchingPersonalizations.map((experience) => {
        return {
          experienceId: experience.id,
          variantIndex: getVariantIndex(experience, profile),
        };
      }),
      ...(firstExperiment
        ? [
            {
              experienceId: firstExperiment.id,
              variantIndex: getVariantIndex(firstExperiment, profile),
            },
          ]
        : []),
    ];

    const newUrl = new URL(request.url);
    const variantsPath = variantSelections
      .map((selection) => {
        return `${selection.experienceId}=${selection.variantIndex}`;
      })
      .sort()
      .join(',');
    newUrl.pathname = `/;${variantsPath}${newUrl.pathname}`;
    // remove trailing slash
    newUrl.pathname = newUrl.pathname.replace(/\/$/, '');
    const newRequest = new Request(newUrl.href, request);

    console.log(newUrl.href);

    const response = await cachedFetcher.fetch(newRequest);
    const newResponse = new Response(response.body, response);

    newResponse.headers.append('Set-Cookie', `ntaid=${profile.id}`);
    newResponse.headers.append('Set-Cookie', `ntpc=${JSON.stringify(cache)}`);

    return newResponse;
  },
};
