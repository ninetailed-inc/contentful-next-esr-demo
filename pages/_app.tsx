import React from 'react';
import '@/styles/globals.css';
import { AppProps } from 'next/app';
import {
  ESRProvider,
  NinetailedProvider,
} from '@ninetailed/experience.js-next';
import { NinetailedSsrPlugin } from '@ninetailed/experience.js-plugin-ssr';
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
        plugins={[new NinetailedSsrPlugin()]}
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
