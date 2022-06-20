import React from 'react';

const ElasticSearchHighlights = ({ highlight, indexResult }) => {

  const [toggleDetails, setToggleDetails] = React.useState(false);

  // TODO Make configurable
  let fieldmapping = {
    title: 'Titel',
    description: 'Beschreibung',
    subjects: 'allgemeine Tags',
    freemanualtags_searchable: 'Tags',
    blocks_plaintext: 'Inhalt',
    manualfilecontent: 'Inhalt PDF',
  };

  const showDetails = () => {
    setToggleDetails(!toggleDetails);
  };

  let hlts = [];
  highlight &&
    Object.keys(highlight)
      .reverse()
      .forEach((fld) => {
        highlight[fld].forEach((mtch) => {
          hlts.push(mtch);
        });
      });
  if (highlight) {
    return !toggleDetails ? (
      <div
        className="highlight metadata"
        onClick={showDetails}
        role="button"
        onKeyPress={showDetails}
        tabIndex={indexResult}
      >
        {hlts.slice(0, 3).map((el, index) => {
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
                  Matches in <b>{fieldmapping[fld]}:</b>
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

export default ElasticSearchHighlights;
