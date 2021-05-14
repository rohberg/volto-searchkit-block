import React from 'react';

import FacetedSearch from '../../Views/FacetedSearch';

const View = ({ data }) => {
  return (
    <div className="block searchkitsearch">
      <FacetedSearch data={data} overriddenComponents={{}} />
    </div>
  );
};

export default View;
