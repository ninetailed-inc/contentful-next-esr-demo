import { NINETAILED_ANONYMOUS_ID_COOKIE } from '@ninetailed/experience.js-shared';

import {
  buildNinetailedEdgeRequestContext,
  CachedFetcher,
  fetchEdgeProfile,
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

    const { profile, experiences } = await fetchEdgeProfile(
      fetchProfileOptions
    );

    const variantSelections: VariantSelection[] = [
      ...experiences.map((experience) => {
        return {
          experienceId: experience.experienceId,
          variantIndex: experience.variantIndex,
        };
      }),
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

    newResponse.headers.append(
      'Set-Cookie',
      `${NINETAILED_ANONYMOUS_ID_COOKIE}=${profile.id}`
    );

    return newResponse;
  },
};
