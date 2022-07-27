import React from 'react';
import '@/styles/globals.css';
import { AppProps } from 'next/app';
import {
  ESRProvider,
  NinetailedProvider,
  NinetailedSsrPlugin,
} from '@ninetailed/experience.js-next';
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-plugin-preview';
import { IPage } from '@/types/contentful';

export type IPageProps = {
  page: IPage;
  ninetailed: { experienceVariantsMap: Record<string, number> };
};

const ESRDemoApp = ({ Component, pageProps }: AppProps) => {
  console.log('-------------_RENDER-----------------');
  const { ninetailed, page } = pageProps as IPageProps;
  console.log({ 'APP:PageProps': page });
  console.log({ 'APP:ninetailedProps': ninetailed });

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
        <ESRProvider experienceVariantsMap={ninetailed?.experienceVariantsMap}>
          <Component {...pageProps} />
        </ESRProvider>
      </NinetailedProvider>
    </div>
  );
};

export default ESRDemoApp;
