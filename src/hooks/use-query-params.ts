/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react';

import queryString from 'query-string';
import { useLocation, useNavigate } from 'react-router';

type arrayFormat = queryString.ParseOptions['arrayFormat'];

const defaultArrayFormat: arrayFormat = 'comma';

const defaultOptions: queryString.ParseOptions = {
  arrayFormat: defaultArrayFormat,
  parseNumbers: true,
  parseBooleans: true,
};

export const useQueryParams = <T extends Record<string, any>>() => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = useMemo(() => {
    const parsed = queryString.parse(location.search, {
      ...defaultOptions,
    });

    return parsed as Partial<T>;
  }, [location.search]);

  const setQuery = useCallback(
    (params: Partial<T>) => {
      const mergedParams = {
        ...query,
        ...params,
      };

      const queryString_ = queryString.stringify(mergedParams, {
        arrayFormat: defaultArrayFormat,
        skipNull: true,
        skipEmptyString: true,
      });

      navigate({ search: `?${queryString_}` }, { replace: true });
    },
    [query, navigate],
  );

  const setQueryObject = useCallback(
    (queriesObject: Partial<T>, options: queryString.StringifyOptions = {}) => {
      const stringified = queryString.stringify(queriesObject, {
        arrayFormat: defaultArrayFormat,
        skipNull: true,
        skipEmptyString: true,
        ...options,
      });

      return navigate(`${location.pathname}?${stringified}`);
    },
    [location.pathname, navigate],
  );

  const removeQuery = useCallback(
    (paramKey: keyof T) => {
      const currentParams = { ...query };
      delete currentParams[paramKey as string];

      const queryString_ = queryString.stringify(currentParams, {
        arrayFormat: defaultArrayFormat,
        skipNull: true,
        skipEmptyString: true,
      });

      navigate({ search: queryString_ ? `?${queryString_}` : '' }, { replace: true });
    },
    [query, navigate],
  );

  return { query, setQuery, setQueryObject, removeQuery };
};
