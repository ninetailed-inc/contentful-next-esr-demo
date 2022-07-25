import { ExperienceConfiguration } from '@ninetailed/experience.js';
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
  entry: Entry<any>
): ExperienceConfiguration => {
  return {
    id: entry.sys.id,
    type: entry.fields.nt_type,
    audience: { id: entry.fields.nt_audience.sys.id },
    trafficAllocation: entry.fields.nt_config.traffic,
    distribution: entry.fields.nt_config.scatteredDistribution,
    components: entry.fields.nt_config.components,
  };
};

export const getExperiencesOnPage = async (
  slug: string
): Promise<ExperienceConfiguration[]> => {
  // TODO: move to env
  const pageContentTypeId = 'page';

  const pageQuery = `content_type=${pageContentTypeId}&fields.slug=${slug}&limit=1&include=10`;

  const page = await getEntries(pageQuery);

  // Contentful doesn't type the 'includes' field
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return (page.includes.Entry as Entry<any>[])
    .filter(isExperience)
    .map(entryToExperienceConfiguration);
};

export const getAllExperiments = async (): Promise<
  ExperienceConfiguration[]
> => {
  // TODO: move to env
  const experienceContentTypeId = 'nt_experience';

  const allExperiencesQuery = `content_type=${experienceContentTypeId}`;

  const allExperiences = await getEntries(allExperiencesQuery);

  return allExperiences.items
    .filter(isExperiment)
    .map(entryToExperienceConfiguration);
};
