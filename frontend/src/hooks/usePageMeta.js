import { useEffect } from 'react';
import { useStudio } from '../context/StudioContext';

export function usePageMeta(title) {
  const { settings } = useStudio();
  const name = settings?.studioName || 'Nail Studio';
  useEffect(() => {
    document.title = title ? `${title} · ${name}` : `${name} · Nail art & press-on sets`;
  }, [title, name]);
}
