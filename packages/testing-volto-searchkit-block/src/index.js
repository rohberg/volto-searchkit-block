export const monolingualFixture = (config) => {
  config.settings.isMultilingual = false;
  config.settings.supportedLanguages = ['de'];
  config.settings.defaultLanguage = 'de';

  return config;
};

export const multilingualFixture = (config) => {
  config.settings.isMultilingual = true;
  config.settings.supportedLanguages = ['de', 'en'];
  config.settings.defaultLanguage = 'de';

  return config;
};

const applyConfig = (config) => {
  return config;
};

export default applyConfig;
