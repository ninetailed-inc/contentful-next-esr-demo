import {
  ESRLoadingComponent,
  Experience,
} from '@ninetailed/experience.js-next';
import {
  ExperienceEntry,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import * as Contentful from 'contentful';
import get from 'lodash/get';
import React from 'react';

import { Banner } from '@/components/Banner';
import { CTA } from '@/components/Cta';
import { Feature } from '@/components/Feature';
import { Footer } from '@/components/Footer';
import { Form } from '@/components/Form';
import { Hero } from '@/components/Hero';
import { Navigation } from '@/components/Navigation';
import { PricingPlan } from '@/components/PricingPlan';
import { PricingTable } from '@/components/PricingTable';

import { ComponentContentTypes } from '@/lib/constants';

const ContentTypeMap = {
  [ComponentContentTypes.Hero]: Hero,
  [ComponentContentTypes.CTA]: CTA,
  [ComponentContentTypes.Feature]: Feature,
  [ComponentContentTypes.Banner]: Banner,
  [ComponentContentTypes.Navigation]: Navigation,
  [ComponentContentTypes.Footer]: Footer,
  [ComponentContentTypes.PricingPlan]: PricingPlan,
  [ComponentContentTypes.PricingTable]: PricingTable,
  [ComponentContentTypes.Form]: Form,
};

type PersonalizedFields<T> = T & {
  nt_variants?: Contentful.Entry<{
    nt_audience?: Contentful.Entry<{
      id: Contentful.EntryFields.Symbol;
    }>;
  }>[];
  nt_experiences?: ExperienceEntry[];
};

type Block = Contentful.Entry<PersonalizedFields<unknown>> & {
  parent?: Contentful.Entry<any>;
};

type BlockRendererProps = {
  block: Block | Block[];
};

type ComponentRendererProps = Contentful.Entry<unknown>;

const ComponentRenderer: React.FC<ComponentRendererProps> = (props) => {
  const contentTypeId = get(props, 'sys.contentType.sys.id') as string;
  const Component = ContentTypeMap[contentTypeId];

  if (!Component) {
    console.warn(`${contentTypeId} can not be handled`);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Component {...props} />;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
  if (Array.isArray(block)) {
    return (
      <>
        {block.map((b, index) => {
          return <BlockRenderer key={`block-${b.sys.id}-${index}`} block={b} />;
        })}
      </>
    );
  }

  const contentTypeId = get(block, 'sys.contentType.sys.id') as string;
  const Component = ContentTypeMap[contentTypeId];

  if (!Component) {
    console.warn(`${contentTypeId} can not be handled`);
    return null;
  }

  const { id } = block.sys;

  const componentProps = {
    ...block,
    parent: block.parent,
  };

  const experiences = (componentProps.fields.nt_experiences || [])
    .filter((ctfExperienceEntry) => {
      return ExperienceMapper.isExperienceEntry(ctfExperienceEntry);
    })
    .map((experience) => {
      return ExperienceMapper.mapExperience(experience);
    });

  return (
    <div key={`${contentTypeId}-${id}`}>
      <Experience
        {...componentProps}
        id={componentProps.sys.id}
        component={ComponentRenderer}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        experiences={experiences}
        loadingComponent={ESRLoadingComponent}
      />
    </div>
  );
};

export { BlockRenderer };
