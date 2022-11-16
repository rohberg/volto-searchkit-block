/**
 * Show matches per document
 * fragment_size is set in CustomESRequestSerializer
 */
import React from 'react';
import { useIntl } from 'react-intl';
import messages from '../../messages';

export const ElasticSearchHighlights = ({ highlight, indexResult }) => {
  const [toggleDetails, setToggleDetails] = React.useState(false);

  const intl = useIntl();

  let fieldmapping = {
    title: intl.formatMessage(messages.title),
    description: intl.formatMessage(messages.description),
    subjects: intl.formatMessage(messages.tags),
    freemanualtags_searchable: intl.formatMessage(messages.tags),
    blocks_plaintext: intl.formatMessage(messages.content),
    manualfilecontent: intl.formatMessage(messages.content),
  };

  const showDetails = () => {
    setToggleDetails(!toggleDetails);
  };

  const fragments = getFragments(highlight);
  if (highlight) {
    return !toggleDetails ? (
      <div
        className="highlight metadata"
        onClick={showDetails}
        role="button"
        onKeyPress={showDetails}
        tabIndex={indexResult}
      >
        {fragments.slice(0, 3).map((el, index) => {
          return <div dangerouslySetInnerHTML={{ __html: el }} key={index} />;
        })}
      </div>
    ) : (
      <div
        className="highlight metadata"
        onClick={showDetails}
        role="button"
        onKeyPress={showDetails}
        tabIndex={indexResult}
      >
        {Object.keys(highlight)
          .reverse()
          .map((fld) => {
            return (
              <div className="highlighfld" key={fld}>
                <div>
                  Matches in <b>{fieldmapping[fld] || fld}:</b>
                </div>
                <ul>
                  {highlight[fld].map((el, index) => {
                    return (
                      <li
                        dangerouslySetInnerHTML={{ __html: el }}
                        key={index}
                      />
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </div>
    );
  } else {
    return null;
  }
};

/**
 * Get fragments of matches in a document
 * @param {Object} highlight. part of response of Elasticsearch query
 * @returns {Array} Array of strings
 */
export const getFragments = (highlight) => {
  let fragments = [];
  highlight &&
    Object.keys(highlight)
      .reverse()
      .forEach((fld) => {
        highlight[fld].forEach((mtch) => {
          fragments.push(mtch);
        });
      });
  return fragments;
};

/**
 * Get matches in a document
 * @param {Object} highlight. part of response of Elasticsearch query
 * @returns {Array} Array of strings
 */
export const getMatches = (highlight) => {
  const regex = /<em>(.*?)<\/em>/gm;
  let fragments = getFragments(highlight);
  let matches = [];
  fragments.forEach((fragment) => {
    const fragmentmatches = [...fragment.matchAll(regex)];
    matches = matches.concat(fragmentmatches.map((match) => match[1]));
  });
  matches = [...new Set(matches)];
  return matches;
};

export const ElasticSearchMatches = ({ highlight, indexResult }) => {
  const matches = getMatches(highlight);
  return (
    <div className="highlight metadata" role="button" tabIndex={indexResult}>
      {matches.join(' | ')}
      <hr />
    </div>
  );
};
