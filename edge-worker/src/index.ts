import { buildNinetailedEdgeRequestContext, fetchEdgeProfile } from './utils';

type Cookies = {
  [key: string]: string;
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
  const ip = request.headers.get('CF-Connecting-IP');
  return ip;
};

export default {
  async fetch(request: Request, env): Promise<Response> {
    if (!request.headers.get('Accept').includes('text/html')) {
      return fetch(request);
    }

    const { profile } = await fetchEdgeProfile({
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
    });

    console.log(profile);

    if (!profile?.audiences?.length) {
      return fetch(request);
    }

    const newUrl = new URL(request.url);
    const audiencePath = profile.audiences?.join(',');
    newUrl.pathname = `/;${audiencePath}${newUrl.pathname}`;
    // remove trailing slash
    newUrl.pathname = newUrl.pathname.replace(/\/$/, '');
    const newRequest = new Request(newUrl.href, request);
    return fetch(newRequest);
  },
};
