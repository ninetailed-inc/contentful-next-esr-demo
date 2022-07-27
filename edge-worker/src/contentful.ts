import { ExperienceConfiguration } from '@ninetailed/experience.js';
import {
  ExperienceMapper,
  ExperienceEntry,
} from '@ninetailed/experience.js-utils-contentful';
import type { Entry, EntryCollection } from 'contentful';

const getEntries = async <T>(query: string): Promise<EntryCollection<T>> => {
  // TODO: move to env
  const spaceId = '0v4fokltf8be';
  const environmentId = 'master';
  const apiToken = '75D4l5iQiudHd0abirtsEyrox801L_zlYuCuPYFjoU8';

  const baseUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries`;
  const headers = {
    method: 'GET',
    headers: new Headers({
      Authorization: `Bearer ${apiToken}`,
    }),
  };

  const response = await fetch(`${baseUrl}?${query}`, headers);
  const responseBody = await response.json();

  return responseBody as EntryCollection<T>;
};

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

export const getExperiencesOnPage = async (
  slug: string
): Promise<ExperienceConfiguration[]> => {
  // TODO: move to env
  const pageContentTypeId = 'page';

  const pageQuery = `content_type=${pageContentTypeId}&fields.slug=${slug}&limit=1&include=10`;

  // TODO: add caching
  const page = await getEntries(pageQuery);

  // Contentful doesn't type the 'includes' field
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return (page.includes.Entry as ExperienceEntry[])
    .filter(isExperience)
    .map(entryToExperienceConfiguration);
};

export const getAllExperiments = async (): Promise<
  ExperienceConfiguration[]
> => {
  // TODO: move to env
  const experienceContentTypeId = 'nt_experience';

  const allExperiencesQuery = `content_type=${experienceContentTypeId}`;

  // TODO: add caching
  const allExperiences = await getEntries(allExperiencesQuery);

  return (allExperiences.items as ExperienceEntry[])
    .filter(isExperiment)
    .map(entryToExperienceConfiguration);
};
