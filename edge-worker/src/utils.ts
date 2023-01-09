import {
  buildIdentifyEvent,
  buildPageEvent,
  GeoLocation,
  NinetailedRequestContext,
  Profile,
  Traits,
  NinetailedApiClient,
} from '@ninetailed/experience.js-shared';
import { parse as parseLanguage } from 'accept-language-parser';
import { v4 as uuid } from 'uuid';

import {
  ExperienceConfiguration,
  selectDistribution,
} from '@ninetailed/experience.js';
import { NINETAILED_ANONYMOUS_ID_COOKIE } from '@ninetailed/experience.js-plugin-ssr';

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

type SendIdentifyOptions = GetServerSideProfileOptions & {
  traits: Traits;
};

export const getVariantIndex = (
  experience: ExperienceConfiguration,
  profile: Profile
): number => {
  const distribution = selectDistribution({
    experience,
    profile,
  });

  return distribution?.index ?? 0;
};

export const sendIdentify = async ({
  ctx,
  cookies,
  traits,
  clientId,
  environment,
  url,
  ip,
  location,
}: SendIdentifyOptions) => {
  const apiClient = new NinetailedApiClient({ clientId, environment, url });
  const anonymousId = cookies[NINETAILED_ANONYMOUS_ID_COOKIE];

  const identifyEvent = buildIdentifyEvent({
    traits,
    ctx,
    messageId: uuid(),
    timestamp: Date.now(),
    userId: '',
  });

  const profile = await apiClient.upsertProfile(
    {
      profileId: anonymousId,
      events: [
        { ...identifyEvent, context: { ...identifyEvent.context, location } },
      ],
    },
    { ip }
  );

  return profile;
};

export const fetchEdgeProfile = async ({
  ctx,
  cookies,
  clientId,
  environment,
  url,
  ip,
  location,
}: GetServerSideProfileOptions): Promise<Profile> => {
  const apiClient = new NinetailedApiClient({ clientId, environment, url });
  const anonymousId = cookies[NINETAILED_ANONYMOUS_ID_COOKIE];

  const pageEvent = buildPageEvent({
    ctx,
    messageId: uuid(),
    timestamp: Date.now(),
    properties: {},
  });

  const profile = await apiClient.upsertProfile(
    {
      profileId: anonymousId,
      events: [{ ...pageEvent, context: { ...pageEvent.context, location } }],
    },
    { ip, preflight: true }
  );

  return profile;
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

export type CachedFetcherProps = {
  context: ExecutionContext;
  defaultTtl: number;
};
export class CachedFetcher {
  private readonly context: ExecutionContext;

  private readonly defaultTtl: number;

  constructor({ context, defaultTtl }: CachedFetcherProps) {
    this.context = context;
    this.defaultTtl = defaultTtl;
  }

  async fetch(request: Request, ttl?: number): Promise<Response> {
    const cacheTtl = ttl ?? this.defaultTtl;

    const cache = caches.default;
    const cachedResponse = await cache.match(request.url);

    if (!cachedResponse) {
      console.log(`cache miss ${request.url}`);
      return CachedFetcher.fetchAndCacheResponse(request);
    }
    console.log(`cache hit ${request.url}`);

    const cacheTimestamp = cachedResponse.headers.get('Cache-Timestamp');
    const cacheAge = (Date.now() - Number(cacheTimestamp)) / 1000;
    const stale = !cacheTimestamp || cacheAge > cacheTtl;

    console.log(
      `cache age: ${cacheAge} | ttl: ${cacheTtl} | stale: ${stale.toString()}`
    );

    if (stale) {
      this.context.waitUntil(CachedFetcher.fetchAndCacheResponse(request));
    }

    return cachedResponse;
  }

  private static fetchAndCacheResponse = async (
    request: Request
  ): Promise<Response> => {
    const cache = caches.default;
    const response = await fetch(request);
    const clonedResponse = response.clone();
    const responseToCache = new Response(clonedResponse.body, clonedResponse);
    // add a timestamp header to the response to be used for cache revalidation
    responseToCache.headers.append('Cache-Timestamp', String(Date.now()));
    responseToCache.headers.set(
      'Cache-Control',
      `s-maxage=${60 * 60 * 24 * 365}`
    );
    await cache.put(request.url, responseToCache);
    console.log(`caching ${request.url}`);
    return response;
  };
}
