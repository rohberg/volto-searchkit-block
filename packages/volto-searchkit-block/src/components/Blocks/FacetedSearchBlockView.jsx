import FacetedSearch from '../Views/FacetedSearch';

const View = ({ data }) => {
  return (
    <div className="block searchkitsearch">
      <FacetedSearch data={data} />
    </div>
  );
};

export default View;
