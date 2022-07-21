import React from 'react';
import '@/styles/globals.css';
import { AppProps } from 'next/app';
import {
  NinetailedProvider,
  NinetailedSsrPlugin,
  Profile,
} from '@ninetailed/experience.js-next';
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-plugin-preview';
import Cookies from 'js-cookie';
import { IPage } from '@/types/contentful';

export type IPageProps = {
  page: IPage;
  ninetailed: { audiences: string[] };
};

const ESRDemoApp = ({ Component, pageProps }: AppProps) => {
  console.log('-------------_RENDER-----------------');
  const { ninetailed, page } = pageProps as IPageProps;
  console.log({ 'APP:PageProps': page });
  const audiences = ninetailed?.audiences || [];
  console.log({ 'APP:ninetailedProps': ninetailed });
  console.log({ 'APP:audiences': audiences });
  const profile = React.useMemo(() => {
    const id = Cookies.get('ntaid') as string;
    console.log({ 'APP:ntaid': id });
    const defaultProfile: Profile = {
      id,
      random: 0,
      audiences,
      traits: {},
      session: {
        isReturningVisitor: false,
        count: 0,
        landingPage: {
          path: '',
          query: {},
          referrer: '',
          search: '',
          url: '',
        },
        activeSessionLength: 0,
        averageSessionLength: 0,
      },
      location: {},
    };
    return defaultProfile;
  }, []);

  console.log({ 'APP:pageProps': pageProps });
  console.log({
    'APP:NINETAILED_API_KEY': process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID,
  });
  console.log({
    'APP:NINETAILED_ENVIRONMENT':
      process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT,
  });

  return (
    <div className="app">
      <NinetailedProvider
        profile={profile}
        plugins={[
          NinetailedSsrPlugin(),
          NinetailedPreviewPlugin({
            clientId:
              process.env.NEXT_PUBLIC_NINETAILED_MANAGEMENT_CLIENT_ID ?? '',
            secret: process.env.NEXT_PUBLIC_NINETAILED_MANAGEMENT_SECRET ?? '',
            environment:
              process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT ?? 'main',
            ui: { opener: { hide: false } },
          }),
        ]}
        clientId={process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID ?? ''}
        environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT ?? 'main'}
      >
        <Component {...pageProps} />
      </NinetailedProvider>
    </div>
  );
};

export default ESRDemoApp;
