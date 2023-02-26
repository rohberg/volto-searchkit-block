import React from 'react';
import { keyBy } from 'lodash';
import { withState } from 'react-searchkit';
import { BodyClass } from '@plone/volto/helpers';
// import StateLogger from '../StateLogger';

const _SectionsSearch = (props) => {
  const {
    allow_search_excluded_sections,
    show_filter_for_excluded_sections,
    search_sections,
    currentQueryState,
    updateQueryState,
  } = props;
  const [activeSection, setActiveSection] = React.useState('all');
  const [doc_count_others, setDoc_count_others] = React.useState(0);
  const [doc_count_all, setDoc_count_all] = React.useState(0);
  const [search_sections_dict, setSearch_sections_dict] = React.useState({});

  React.useEffect(() => {
    setSearch_sections_dict(
      keyBy(search_sections?.items || [], (el) => {
        return el.section;
      }),
    );

    if (
      props.currentResultsState.data.aggregations.section_agg?.section_agg
        ?.buckets
    ) {
      const buckets =
        props.currentResultsState.data.aggregations.section_agg?.section_agg
          ?.buckets;
      let bucket_dict = {};
      buckets.forEach((el) => {
        bucket_dict[el.key] = el.doc_count;
      });

      // calculate doc_counts of others and all
      let count_others = 0;
      let count_all = 0;
      Object.keys(bucket_dict).forEach((el) => {
        if (!Object.keys(search_sections_dict).includes(el)) {
          count_others = count_others + bucket_dict[el];
        }
      });
      Object.keys(bucket_dict).forEach((el) => {
        count_all = count_all + bucket_dict[el];
      });
      setDoc_count_others(count_others);
      setDoc_count_all(count_all);
    }
  }, [
    props.currentResultsState.data.aggregations,
    activeSection,
    search_sections,
  ]);

  const restrictSearchToSection = (section) => {
    setActiveSection(section);
    let kitquerystate = {
      sortBy: 'modified',
      sortOrder: 'desc',
      layout: 'list',
      page: 1,
      size: 10,
      filters: currentQueryState.filters,
    };
    if (currentQueryState.queryString) {
      kitquerystate.queryString = currentQueryState.queryString;
    }

    // Empty filters for sections without filter
    if (
      (search_sections_dict[section] &&
        !search_sections_dict[section].show_filter) ||
      (section === 'others' && !show_filter_for_excluded_sections)
    ) {
      kitquerystate.filters = [];
    }
    // Replace filter 'section'
    kitquerystate.filters = kitquerystate.filters.filter((el) => {
      return el[0] !== 'section';
    });
    if (section === 'all') {
      // pass
    } else if (section === 'others') {
      kitquerystate.filters.push(['section', section]);
    } else {
      kitquerystate.filters.push(['section', section]);
    }
    // Do search!
    updateQueryState(kitquerystate);
  };

  return (
    <>
      <BodyClass
        className={
          (search_sections_dict[activeSection] &&
            !search_sections_dict[activeSection].show_filter) ||
          (activeSection === 'others' && !show_filter_for_excluded_sections)
            ? 'section_without_filter'
            : ''
        }
      />
      <div className="searchsections">
        {search_sections?.items?.length > 0 ? (
          <button
            className={activeSection === 'all' ? 'active' : ''}
            onClick={() => restrictSearchToSection('all')}
          >
            Überall <span className="count">{`(${doc_count_all})`}</span>
          </button>
        ) : null}
        {search_sections?.items?.length > 0 &&
        allow_search_excluded_sections ? (
          <button
            className={activeSection === 'others' ? 'active' : ''}
            onClick={() => restrictSearchToSection('others')}
          >
            Website <span className="count">{`(${doc_count_others})`}</span>
          </button>
        ) : null}
        {search_sections
          ? search_sections.items.map((el) => {
              return (
                <button
                  key={el.section}
                  className={activeSection === el.section ? 'active' : ''}
                  onClick={() => restrictSearchToSection(el.section)}
                >
                  {el.label}{' '}
                  <span className="count">{`(${
                    props.currentResultsState.data.aggregations.section_agg
                      ?.section_agg?.buckets
                      ? props.currentResultsState.data.aggregations.section_agg.section_agg.buckets.find(
                          (bucket) => bucket.key === el.section,
                        )?.doc_count || 0
                      : 0
                  })`}</span>
                </button>
              );
            })
          : null}
      </div>
      {/* <StateLogger /> */}
    </>
  );
};

export default withState(_SectionsSearch);
