import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';

const FooComponent = ({ data }) => {
  const vocabularies = useSelector((state) => state.querystring?.indexes);
  function exportFiltersMapping(data) {
    const filternames = data.facet_fields?.map((el) => {
      return el.field.value;
    });
    let ff = {};
    filternames?.forEach((fname) => {
      let foo = vocabularies[fname].values;
      Object.keys(foo).forEach((el) => {
        ff[el] = foo[el].title;
      });
    });
    let map = {
      facet_fields: ff,
      search_sections:
        data.search_sections &&
        Object.fromEntries(
          data.search_sections.items.map((el) => {
            return [el.section, el.label];
          }),
        ),
    };
    const fileData = JSON.stringify(map);
    const blob = new Blob([fileData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'filter-mapping.json';
    link.href = url;
    link.click();
  }

  return (
    <Button
      onClick={() => {
        exportFiltersMapping(data);
      }}
    >
      Export filter mapping
    </Button>
  );
};

export default FooComponent;
