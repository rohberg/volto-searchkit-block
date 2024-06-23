import React from 'react';
import config from '@plone/volto/registry';

class NoSSR extends React.Component {
  state = {
    isClient: false,
  };
  componentDidMount() {
    this.setState({ isClient: true });
  }
  render() {
    const { isClient } = this.state;
    const { children } = this.props;
    return isClient ? children : null;
  }
}

// TODO replace ugly  flattenESUrlToPath hack. Problem Elastic responds with backend Plone url which is host.docker….
/**
 * flatten url to path if internal, else leave it as it is
 * @param {String} url
 * @returns path
 *
 * "http://host.docker.internal:17091/Plone/news/sprint-on-accessibility"
 * ->
 * "/news/sprint-on-accessibility"
 */
function flattenESUrlToPath(url) {
  if (url.startsWith('https')) {
    // external url
    return url;
  }
  const urlArray = url.split(':');
  const newPathname = `http://localhost:${urlArray.pop()}`.replace(
    config.settings.internalApiPath,
    '',
  );
  return newPathname;
}

const scrollToTarget = (target, offsetHeight = 0) => {
  target.scrollIntoView({
    behavior: 'smooth',
  });
};

/**
 * @param {Array} objlst array of Objects with ...
 * @returns Object with fieldname as key and title as value
 */
function getObjectFromObjectList(objlst) {
  let obj = {};
  if (!objlst) {
    return {};
  }
  objlst.forEach((listitem) => {
    if (listitem.field) {
      obj[listitem.field.value] = listitem.title;
    }
  });
  return obj;
}

export { NoSSR, flattenESUrlToPath, scrollToTarget, getObjectFromObjectList };
