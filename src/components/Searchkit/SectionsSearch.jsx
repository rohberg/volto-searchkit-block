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
    let foo = {
      sortBy: 'modified',
      sortOrder: 'desc',
      layout: 'list',
      page: 1,
      size: 10,
      filters: currentQueryState.filters,
    };
    if (currentQueryState.queryString) {
      foo.queryString = currentQueryState.queryString;
    }
    if (section !== 'all') {
      foo.filters.push(['sectionpath', section]);
    }
    console.debug('foo', foo);
    updateQueryState(foo);
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
            className={activeSection === 'website' ? 'active' : ''}
            onClick={() => restrictSearchToSection('website')}
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
