import { ExperienceConfiguration } from '@ninetailed/experience.js';
import {
  ExperienceEntry,
  ExperienceEntryLike,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import type { Entry, EntryCollection } from 'contentful';
import { CachedFetcher } from './utils';

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

const resolveExperienceEntry = <T extends object>(
  ctfExperienceEntry: ExperienceEntryLike<T>,
  includes?: { Entry: Entry<any>[] }
): ExperienceEntry<T> => ({
  ...ctfExperienceEntry,
  fields: {
    ...ctfExperienceEntry.fields,
    nt_audience: includes?.Entry.find(
      (entry) => entry.sys.id === ctfExperienceEntry.fields.nt_audience?.sys.id
    ),
    //@ts-ignore
    nt_variants: ctfExperienceEntry.fields.nt_variants?.map((variant) =>
      includes?.Entry.find((entry) => entry.sys.id === variant.sys.id)
    ),
  },
});

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

    return (page.includes.Entry as Entry<any>[])
      .filter((ctfEntry) => ctfEntry.sys.contentType.sys.id === 'nt_experience')
      .map((ctfExperienceEntry) =>
        resolveExperienceEntry(ctfExperienceEntry, page.includes)
      )
      .filter(ExperienceMapper.isExperienceEntry)
      .map(ExperienceMapper.mapExperience);
  };

  getAllExperiments = async (): Promise<ExperienceConfiguration[]> => {
    // TODO: move to env
    const experienceContentTypeId = 'nt_experience';

    const allExperiencesQuery = `content_type=${experienceContentTypeId}`;

    // TODO: add caching
    const allExperiences = await this.getEntries(allExperiencesQuery);

    return (allExperiences.items as ExperienceEntry[])
      .map((ctfExperienceEntry) =>
        resolveExperienceEntry(ctfExperienceEntry, allExperiences.includes)
      )
      .filter(ExperienceMapper.isExperienceEntry)
      .filter(ExperienceMapper.isExperiment)
      .map(ExperienceMapper.mapExperiment);
  };
}
