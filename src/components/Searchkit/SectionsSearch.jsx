import React from 'react';
import { withState } from 'react-searchkit';
import StateLogger from '../StateLogger';

const _SectionsSearch = ({
  allow_search_excluded_sections,
  search_sections,
  currentQueryState,
  updateQueryState,
}) => {
  const [activeSection, setActiveSection] = React.useState('all');
  const restrictSearchToSection = (section) => {
    console.debug('restrictSearchToSection');
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

    console.debug('kitquerystate.filters', kitquerystate.filters);
    updateQueryState(kitquerystate);
  };

  return (
    <>
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
