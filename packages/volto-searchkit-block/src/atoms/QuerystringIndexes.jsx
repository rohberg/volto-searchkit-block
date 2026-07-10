import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSetAtom } from 'jotai';
import { getQuerystring } from '@plone/volto/actions/querystring/querystring';
import { querystringIndexesAtom } from './index';

export const FetchQuerystringIndexes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getQuerystring());
  }, [dispatch]);

  return null;
};

export const InitializeAtom = () => {
  const setQuerystringIndexes = useSetAtom(querystringIndexesAtom);
  const indexes = useSelector((state) => state.querystring?.indexes);

  useEffect(() => {
    if (indexes) {
      setQuerystringIndexes(indexes);
    }
  }, [indexes, setQuerystringIndexes]);

  return null;
};
