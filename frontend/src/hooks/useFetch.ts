import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

export function useFetch<T>(load: () => Promise<T>, deps: unknown[], initial: T) {
  const { showError } = useToast();
  const [data, setData] = useState<T>(initial);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false; 
    load()
      .then(result => { if (!ignore) setData(result); })
      .catch((error: Error) => showError(error.message));
    return () => { ignore = true; };
  }, [...deps, version]);

  return { data, reload: () => setVersion(v => v + 1) };
}
