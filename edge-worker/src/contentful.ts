import { ExperienceConfiguration } from '@ninetailed/experience.js';
import {
  ExperienceEntry,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import type { Entry, EntryCollection } from 'contentful';
import { CachedFetcher } from './utils';

const isExperience = (entry: Entry<any>): boolean => {
  // TODO: move to env
  return entry.sys.contentType.sys.id === 'nt_experience';
};

const isExperiment = (entry: Entry<any>): boolean => {
  return entry.fields.nt_type === 'nt_experiment';
};

export const entryToExperienceConfiguration = (
  entry: ExperienceEntry
): ExperienceConfiguration => {
  return ExperienceMapper.mapExperience(entry);
};

type ContentfulClientProps = {
  cachedFetcher: CachedFetcher;
  spaceId: string;
  environmentId: string;
  apiToken: string;
};

export class ContentfulClient {
  private readonly cachedFetcher: CachedFetcher;

  private readonly baseUrl: string;

  private readonly authHeaders: { headers: Headers };

  constructor({
    cachedFetcher,
    spaceId,
    environmentId,
    apiToken,
  }: ContentfulClientProps) {
    this.cachedFetcher = cachedFetcher;
    this.baseUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries`;
    this.authHeaders = {
      headers: new Headers({
        Authorization: `Bearer ${apiToken}`,
      }),
    };
  }

  getEntries = async <T>(query: string): Promise<EntryCollection<T>> => {
    const request = new Request(`${this.baseUrl}?${query}`, this.authHeaders);

    const response = await this.cachedFetcher.fetch(request);
    const responseBody = await response.json();

    return responseBody as EntryCollection<T>;
  };

  getExperiencesOnPage = async (
    slug: string
  ): Promise<ExperienceConfiguration[]> => {
    const pageContentTypeId = 'page';
    const pageQuery = `content_type=${pageContentTypeId}&fields.slug=${slug}&limit=1&include=10`;

    const page = await this.getEntries(pageQuery);

    // Contentful doesn't type the 'includes' field
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (page.includes.Entry as ExperienceEntry[])
      .filter(isExperience)
      .map(entryToExperienceConfiguration);
  };

  getAllExperiments = async (): Promise<ExperienceConfiguration[]> => {
    // TODO: move to env
    const experienceContentTypeId = 'nt_experience';

    const allExperiencesQuery = `content_type=${experienceContentTypeId}`;

    // TODO: add caching
    const allExperiences = await this.getEntries(allExperiencesQuery);

    return (allExperiences.items as ExperienceEntry[])
      .filter(isExperiment)
      .map(entryToExperienceConfiguration);
  };
}
