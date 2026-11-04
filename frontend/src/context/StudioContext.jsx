import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { studioService } from '../services/studioService';

const StudioContext = createContext({ settings: null, refresh: () => {} });

export function StudioProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setSettings(await studioService.getSettings());
    } catch {
      // Footer and checkout degrade to defaults if settings cannot load.
      setSettings((s) => s);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ settings, refresh }), [settings, refresh]);
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export const useStudio = () => useContext(StudioContext);
