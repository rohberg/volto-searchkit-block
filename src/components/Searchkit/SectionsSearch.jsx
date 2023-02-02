import React from 'react';
import { keyBy } from 'lodash';
import { withState } from 'react-searchkit';
import { BodyClass } from '@plone/volto/helpers';
// import StateLogger from '../StateLogger';

const _SectionsSearch = ({
  allow_search_excluded_sections,
  show_filter_for_excluded_sections,
  search_sections,
  currentQueryState,
  updateQueryState,
}) => {
  const [activeSection, setActiveSection] = React.useState('all');

  const search_sections_dict = keyBy(search_sections?.items || [], (el) => {
    return el.section;
  });

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
        {search_sections.items?.length > 0 ? (
          <button
            className={activeSection === 'all' ? 'active' : ''}
            onClick={() => restrictSearchToSection('all')}
          >
            Überall
          </button>
        ) : null}
        {search_sections.items?.length > 0 && allow_search_excluded_sections ? (
          <button
            className={activeSection === 'others' ? 'active' : ''}
            onClick={() => restrictSearchToSection('others')}
          >
            Website
          </button>
        ) : null}
        {search_sections.items.map((el) => {
          return (
            <button
              key={el.section}
              className={activeSection === el.section ? 'active' : ''}
              onClick={() => restrictSearchToSection(el.section)}
            >
              {el.label}
            </button>
          );
        })}
      </div>
      {/* <StateLogger /> */}
    </>
  );
};

export default withState(_SectionsSearch);
