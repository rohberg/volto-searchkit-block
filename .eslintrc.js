const fs = require('fs');
const projectRootPath = __dirname;
const { AddonRegistry } = require('@plone/registry/addon-registry');

let coreLocation;
if (fs.existsSync(`${projectRootPath}/core`))
  coreLocation = `${projectRootPath}/core`;
else if (fs.existsSync(`${projectRootPath}/../../core`))
  coreLocation = `${projectRootPath}/../../core`;

const { registry } = AddonRegistry.init(`${coreLocation}/packages/volto`);

// Extends ESlint configuration for adding the aliases to `src` directories in Volto addons
const addonAliases = Object.keys(registry.packages).map((o) => [
  o,
  registry.packages[o].modulePath,
]);

module.exports = {
  extends: `${coreLocation}/packages/volto/.eslintrc`,
  rules: {
    'import/no-unresolved': 1,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@plone/volto', `${coreLocation}/packages/volto/src`],
          ['@plone/volto-slate', `${coreLocation}/packages/volto-slate/src`],
          ['@plone/registry', `${coreLocation}/packages/registry/src`],
          [
            '@rohberg/volto-searchkit-block',
            `${projectRootPath}/packages/volto-searchkit-block/src`,
          ],
          [
            '@plone-collective/volto-bookmarks',
            // `${projectRootPath}/node_modules/.pnpm/@plone-collective+volto-bookmarks@3.0.2_react-dom@18.2.0_react@18.2.0__react@18.2.0/node_modules/@plone-collective/volto-bookmarks/src`,
            `${projectRootPath}/packages/testing-volto-bookmarks/node_modules/@plone-collective/volto-bookmarks/src`,
          ],
          ...addonAliases,
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
  },
};
