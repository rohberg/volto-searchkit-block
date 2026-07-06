import React from 'react';

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

  const urlObj = new URL(url);
  const urlArray = urlObj.pathname.split('/').reverse();
  urlArray.pop();
  urlArray.pop();
  const newPathname = `/${urlArray.reverse().join('/')}`;
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

/**
 *
 * @param {Object} querystringindexes
 * @param {String} fieldname One of the indexes
 * @param {String} key to be translated
 * @returns {String}
 */
const translateQuerystringindex = (querystringindexes, fieldname, key) => {
  let label = key;
  if (querystringindexes && fieldname in querystringindexes) {
    label = querystringindexes[fieldname].values[key]?.title || key;
  }
  return label;
};

export {
  NoSSR,
  getObjectFromObjectList,
  flattenESUrlToPath,
  scrollToTarget,
  translateQuerystringindex,
};
