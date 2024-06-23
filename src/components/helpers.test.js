import config from '@plone/volto/registry';

import { flattenESUrlToPath } from './helpers';

beforeEach(() => {
  config.settings.legacyTraverse = false;
});

const { settings } = config;

describe('helpers', () => {
  describe('flattenESUrlToPath', () => {
    it('flattens a given URL to the app URL', () => {
      // TODO
      // expect(flattenESUrlToPath(`${settings.apiPath}/edit`)).toBe('/edit');
    });
  });
});
