import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  shouldListen: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!shouldListen) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, shouldListen]);

  return ref;
}
