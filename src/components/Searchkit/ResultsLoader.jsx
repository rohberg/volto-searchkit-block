import { Loader } from 'semantic-ui-react';

function ResultsLoaderComponent() {
  return (
    <>
      <Loader active size="large"></Loader>
      <div className="resultsPlaceholder"></div>
    </>
  );
}

export default ResultsLoaderComponent;
