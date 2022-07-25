import {
  selectEligibleExperiences,
  isExperienceMatch,
  selectActiveExperiments,
} from '@ninetailed/experience.js';
import {} from '@ninetailed/experience.js-shared';
import { getAllExperiments, getExperiencesOnPage } from './contentful';
import {
  buildNinetailedEdgeRequestContext,
  EXPERIENCE_TRAIT_PREFIX,
  fetchEdgeProfile,
  sendIdentify,
} from './utils';

type Cookies = {
  [key: string]: string;
};

type Env = {
  NINETAILED_API_KEY: string;
  NINETAILED_ENVIRONMENT: string;
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
      },
    };

    const [{ profile }, allExperiments, experiencesOnPage] = await Promise.all([
      fetchEdgeProfile(fetchProfileOptions),
      getAllExperiments(),
      getExperiencesOnPage(slug),
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

    // Join first experiment (if not in experiment already) and write to profile cache(cookie)
    if (!joinedExperiments.length) {
      const firstExperiment = matchingExperiences.find((experience) => {
        return experience.type === 'nt_experiment';
      });

      if (firstExperiment) {
        const traitKey = `${EXPERIENCE_TRAIT_PREFIX}${firstExperiment.id}`;
        profile.traits[traitKey] = true;
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
    }

    // Get variant index for each matching personalization + one experiment
    // TODO

    // Rewrite URL with matching experience + variant index
    // TODO

    const newUrl = new URL(request.url);
    const audiencePath = profile.audiences.sort().join(',');
    newUrl.pathname = `/;${audiencePath}${newUrl.pathname}`;
    // remove trailing slash
    newUrl.pathname = newUrl.pathname.replace(/\/$/, '');
    const newRequest = new Request(newUrl.href, request);

    const response = (
      await fetch(newRequest, {
        cf: {
          cacheTtl: 60,
          cacheEverything: true,
        },
      })
    ).clone();

    response.headers.append('Set-Cookie', `ntaid=${profile.id}`);

    return response;
  },
};
