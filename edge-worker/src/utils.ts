import {
  buildEmptyCache,
  buildIdentifyEvent,
  buildPageEvent,
  Cache,
  GeoLocation,
  NinetailedRequestContext,
  Profile,
  Traits,
} from '@ninetailed/experience.js-shared';
import { parse as parseLanguage } from 'accept-language-parser';
import { v4 as uuid } from 'uuid';

import { NINETAILED_PROFILE_CACHE_COOKIE } from '@ninetailed/experience.js-plugin-ssr';

const BASE_URL = 'https://api.ninetailed.co';
export const EXPERIENCE_TRAIT_PREFIX = 'nt_experiment_';

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

type SendIdentifyOptions = {
  ctx: NinetailedRequestContext;
  traits: Traits;
  cookies: Cookies;
  clientId: string;
  environment?: string;
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

export const sendIdentify = async ({
  ctx,
  cookies,
  traits,
  clientId,
  environment,
}: SendIdentifyOptions) => {
  const cacheFromCookie = getProfileCache(cookies);
  const anonymousId = cacheFromCookie.id;

  const identifyEvent = buildIdentifyEvent({
    traits,
    anonymousId,
    ctx,
    messageId: uuid(),
    timestamp: Date.now(),
    userId: '',
  });

  await fetch(
    `${BASE_URL}/v1/organizations/${clientId}/environments/${
      environment || 'main'
    }/profiles/${anonymousId}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [identifyEvent],
        ...cacheFromCookie,
      }),
    }
  );
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
  } = await request.json();

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

const getLocale = (request: Request): string => {
  const languageHeader = request.headers.get('Accept-Language');
  const languages = parseLanguage(languageHeader || '');

  const locale = languages
    .map((language) => {
      return `${language.code}${language.region ? `-${language.region}` : ''}`;
    })
    .join(',');

  return locale;
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
