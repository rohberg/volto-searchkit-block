import config from '@plone/volto/registry';

import { flattenESUrlToPath } from './helpers';

beforeEach(() => {
  config.settings.legacyTraverse = false;
});

const { settings } = config;

describe('helpers', () => {
  describe('flattenESUrlToPath', () => {
    it('flattens a given URL to the app URL', () => {
      expect(
        flattenESUrlToPath(
          'http://host.docker.internal:17091/Plone/news/sprint-on-accessibility',
        ),
      ).toBe('/news/sprint-on-accessibility');
      expect(flattenESUrlToPath('https://nzz.ch/arosa/piste')).toBe(
        '/arosa/piste',
      );
    });
  });
});
