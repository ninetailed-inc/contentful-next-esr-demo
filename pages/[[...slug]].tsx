import { GetStaticPaths, GetStaticProps } from 'next';
import { NextSeo } from 'next-seo';
import get from 'lodash/get';

import {
  decodeExperienceVariantsMap,
  useProfile,
} from '@ninetailed/experience.js-next';
import { BlockRenderer } from '@/components/Renderer';
import { getPagesOfType, getPage } from '@/lib/api';
import { PAGE_CONTENT_TYPES } from '@/lib/constants';
import { IPage } from '@/types/contentful';

const Page = ({ page }: { page: IPage }) => {
  const { profile: userProfile } = useProfile();
  console.log({ 'APP:UserProfile': userProfile });
  if (!page) {
    return null;
  }
  const {
    banner,
    navigation,
    sections = [],
    footer,
  } = page.fields.content.fields;

  return (
    <>
      <NextSeo
        title={page.fields.seo?.fields.title || page.fields.title}
        description={page.fields.seo?.fields.description}
        nofollow={page.fields.seo?.fields.no_follow as boolean}
        noindex={page.fields.seo?.fields.no_index as boolean}
      />
      <div className="w-full">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        {banner && <BlockRenderer block={banner} />}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        {navigation && <BlockRenderer block={navigation} />}
        <main>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <BlockRenderer block={sections} />
        </main>

        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        {footer && <BlockRenderer block={footer} />}
      </div>
    </>
  );
};
export const getStaticProps: GetStaticProps = async ({ params, preview }) => {
  const rawSlug = get(params, 'slug', []) as string[];
  const experienceVariantsSlug = rawSlug[0] || '';
  const isPersonalized = experienceVariantsSlug.startsWith(';');
  const experienceVariantsMap = isPersonalized
    ? decodeExperienceVariantsMap(experienceVariantsSlug.split(';')[1])
    : {};
  const slug = isPersonalized ? rawSlug.slice(1).join('/') : rawSlug.join('/');
  const page = await getPage({
    preview,
    slug: slug === '' ? '/' : slug,
    pageContentType: PAGE_CONTENT_TYPES.PAGE,
    childPageContentType: PAGE_CONTENT_TYPES.LANDING_PAGE,
  });
  /* console.log({ 'SLUG:page': page }); */
  return {
    props: { page, ninetailed: { experienceVariantsMap } },
    revalidate: 5,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getPagesOfType({
    pageContentType: PAGE_CONTENT_TYPES.PAGE,
    childPageContentType: PAGE_CONTENT_TYPES.LANDING_PAGE,
  });

  const paths = pages
    .filter((page) => {
      return page.fields.slug !== '/';
    })
    .map((page) => {
      return {
        params: { slug: page.fields.slug.split('/') },
      };
    });
  return {
    paths: [...paths, { params: { slug: [''] } }],
    fallback: 'blocking',
  };
};

export default Page;
