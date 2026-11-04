import { useCallback, useEffect, useRef, useState } from 'react';

// Runs an async loader and tracks loading / error / data. Re-runs when `deps`
// change; `reload()` forces a refresh without flashing the loading state.
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const run = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback((silent = false) => {
    const id = ++run.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(() => loaderRef.current())
      .then(
        (data) => id === run.current && setState({ data, error: null, loading: false }),
        (error) => id === run.current && setState({ data: null, error, loading: false })
      );
  }, []);

  useEffect(() => {
    load();
    return () => {
      run.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => load(true), [load]);
  const retry = useCallback(() => load(false), [load]);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);

  return { ...state, reload, retry, setData };
}
