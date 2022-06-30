import { v4 as uuid } from 'uuid';
import {
  IngestProfileEventsResponseBody,
  Profile,
  GeoLocation,
  NinetailedRequestContext,
  buildPageEvent,
  Cache,
  buildEmptyCache,
} from '@ninetailed/experience.js-shared';
import { NINETAILED_PROFILE_CACHE_COOKIE } from '@ninetailed/experience.js-plugin-ssr';

const BASE_URL = 'https://api.ninetailed.co';

type Cookies = { [key: string]: string };

type GetServerSideProfileOptions = {
  ctx: NinetailedRequestContext;
  cookies: Cookies;
  clientId: string;
  environment?: string;
  url?: string;
  ip?: string;
  location?: GeoLocation;
};

const getProfileCache = (cookies: Cookies): Cache => {
  const cacheString = cookies[NINETAILED_PROFILE_CACHE_COOKIE];

  if (cacheString) {
    try {
      return JSON.parse(decodeURIComponent(cacheString)) as Cache;
    } catch (error) {
      console.error(error);
    }
  }

  return buildEmptyCache();
};

export const fetchEdgeProfile = async ({
  ctx,
  cookies,
  clientId,
  environment,
  url,
  ip,
  location,
}: GetServerSideProfileOptions): Promise<{
  profile: Profile;
  cache: Cache;
}> => {
  const cacheFromCookie = getProfileCache(cookies);
  const anonymousId = cacheFromCookie.id;

  const pageEvent = buildPageEvent({
    ctx,
    anonymousId,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    messageId: uuid(),
    timestamp: Date.now(),
    properties: {},
  });

  const request = await fetch(
    `${url || BASE_URL}/v1/organizations/${clientId}/environments/${
      environment || 'main'
    }/profiles/${anonymousId}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [pageEvent],
        ...cacheFromCookie,
        ...{ ip },
        ...{ location },
      }),
    }
  );

  const {
    data: { profile, traitsUpdatedAt, signals },
  } = (await request.json()) as IngestProfileEventsResponseBody;

  return {
    profile,
    cache: {
      id: profile.id,
      random: profile.random,
      audiences: profile.audiences,
      location: profile.location,
      session: profile.session,
      traitsUpdatedAt,
      traits: profile.traits,
      signals,
      sessions: cacheFromCookie.sessions,
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLocale = (request: Request): string => {
  // TODO get locale from request
  return 'en-US';
};

export const buildNinetailedEdgeRequestContext = (
  request: Request
): NinetailedRequestContext => {
  return {
    url: request.url,
    locale: getLocale(request),
    referrer: request.headers.get('referer') || '',
    userAgent: request.headers.get('user-agent') || '',
  };
};
