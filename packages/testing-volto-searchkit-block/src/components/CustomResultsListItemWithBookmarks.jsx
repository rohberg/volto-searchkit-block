import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Item } from 'semantic-ui-react';
import { FormattedDate } from '@plone/volto/components';
import { flattenESUrlToPath } from '@rohberg/volto-searchkit-block/components/helpers';
import cx from 'classnames';
import { ToggleBookmarkButton } from '@plone-collective/volto-bookmarks/components';

const CustomResultsListItemWithBookmarks = (props) => {
  const { result } = props;
  const item_url = flattenESUrlToPath(result['@id']);
  const locale = useSelector((state) => state.query?.locale);
  const showNewsItemPublishedDate = useSelector(
    (state) => state.query?.data.showNewsItemPublishedDate,
  );
  return (
    <Item
      key={`item_${result['@id']}`}
      className={cx('searchkitresultitem', result.review_state)}
    >
      <Item.Content>
        <Item.Header as={Link} to={item_url}>
          {result.title}
        </Item.Header>
        <Item.Meta>
          {showNewsItemPublishedDate?.includes(result.portal_type) &&
          result.effective ? (
            <FormattedDate date={result.effective} locale={locale} />
          ) : null}
        </Item.Meta>
        <Item.Meta>
          <ToggleBookmarkButton item={result} />
        </Item.Meta>
      </Item.Content>
    </Item>
  );
};

export default CustomResultsListItemWithBookmarks;
