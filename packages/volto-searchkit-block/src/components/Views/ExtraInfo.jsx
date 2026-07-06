import React from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Item } from 'semantic-ui-react';
import { onQueryChanged, withState } from 'react-searchkit';
import { getObjectFromObjectList, translateQuerystringindex } from '../helpers';

const _ExtraInfo = (props) => {
  const { result } = props;

  const extrainfo_fields = getObjectFromObjectList(
    props.currentQueryState.data.extrainfo_fields,
  );
  const facet_fields = getObjectFromObjectList(
    props.currentQueryState.data.facet_fields,
  );
  let subjectsFieldname = props.currentQueryState.data?.subjectsFieldname; // "subjects";

  const querystringindexes = useSelector(
    (state) => state.query?.querystringindexes,
  );

  return (
    <Item.Extra className="metadata">
      {Object.keys(extrainfo_fields).map((extrainfo_key, idx) => {
        if (!result[extrainfo_key]) {
          return null;
        }
        const extrainfo_value = Array.isArray(result[extrainfo_key])
          ? result[extrainfo_key]
          : [result[extrainfo_key]];

        return Object.keys(facet_fields).includes(extrainfo_key) ? (
          <React.Fragment key={extrainfo_key}>
            <span className="label">{extrainfo_fields[extrainfo_key]}:</span>
            {extrainfo_value?.map((item, index) => {
              let tito = translateQuerystringindex(
                querystringindexes,
                extrainfo_key,
                item,
              );
              let payloadOfFilter = {
                searchQuery: {
                  sortBy: 'bestmatch',
                  sortOrder: 'asc',
                  layout: 'list',
                  page: 1,
                  size: props.currentQueryState.data.batchSize,
                  filters: [[`${extrainfo_key}_agg`, item]],
                },
              };
              return (
                <button
                  onClick={() => onQueryChanged(payloadOfFilter)}
                  key={tito}
                >
                  {tito}
                  {index < extrainfo_value.length - 1 ? ',' : null}
                </button>
              );
            })}
            {idx < Object.keys(extrainfo_fields).length - 1 && (
              <span className="metadataseparator">|</span>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment key={extrainfo_key}>
            <span className="label">{extrainfo_fields[extrainfo_key]}:</span>
            {extrainfo_value?.map((item, index) => {
              let tito = item.title || item.token || item;
              return (
                <span key={index}>
                  {tito}
                  {index < extrainfo_value.length - 1 ? ',' : null}
                </span>
              );
            })}
            {idx < Object.keys(extrainfo_fields).length - 1 && (
              <span className="metadataseparator">|</span>
            )}
          </React.Fragment>
        );
      })}

      {Array.isArray(result[subjectsFieldname]) &&
      result[subjectsFieldname]?.length > 0 ? (
        <div className="metadata-tags">
          <span className="label">
            <FormattedMessage id="Tags" defaultMessage="Tags" />:
          </span>
          {result[subjectsFieldname]?.map((item, index) => {
            let tito = item;
            let payloadOfTag = {
              searchQuery: {
                sortBy: 'bestmatch',
                sortOrder: 'asc',
                layout: 'list',
                page: 1,
                size: props.currentQueryState.data.batchSize,
                queryString: tito,
              },
            };
            return (
              <button key={tito} onClick={() => onQueryChanged(payloadOfTag)}>
                {tito}
                {index < result[subjectsFieldname].length - 1 ? (
                  ','
                ) : (
                  <span></span>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </Item.Extra>
  );
};

export default withState(_ExtraInfo);
