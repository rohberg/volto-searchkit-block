import React from 'react';
import { flattenToAppURL } from '@plone/volto/helpers';

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

// TODO replace ugly  flattenESUrlToPath hack. Problem Elastic responds with backend Plone Zeo client url.
function flattenESUrlToPath(url) {
  var pathArray = url.split('/');
  var newPathname = '';
  for (let i = 4; i < pathArray.length; i++) {
    newPathname += '/';
    newPathname += pathArray[i];
  }
  return newPathname;
}

const scrollToTarget = (target, offsetHeight = 0) => {
  const bodyRect = document.body.getBoundingClientRect().top;
  const targetRect = target.getBoundingClientRect().top;
  const targetPosition = targetRect - bodyRect - offsetHeight;

  return window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
};

function getObjectFromObjectList(objlst) {
  let obj = {}
  objlst.forEach((listitem) => {
    obj[listitem.field.value] = listitem.title;
  })
  return obj
}

export { NoSSR, flattenESUrlToPath, scrollToTarget, getObjectFromObjectList };
