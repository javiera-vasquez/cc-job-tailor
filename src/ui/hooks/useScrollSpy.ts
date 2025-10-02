import { useEffect, useState, type RefObject } from 'react';

interface UseScrollSpyOptions {
  /**
   * Array of refs to observe
   */
  refs: RefObject<HTMLElement | null>[];
  /**
   * Root margin for the Intersection Observer
   * @default "0px 0px -80% 0px"
   */
  rootMargin?: string;
  /**
   * Threshold for the Intersection Observer
   * @default 0.1
   */
  threshold?: number;
}

/**
 * Hook that tracks which sections are currently in the viewport
 * Returns a Map of element indices to their visibility state
 */
export function useScrollSpy({
  refs,
  rootMargin = '0px 0px -80% 0px',
  threshold = 0.1,
}: UseScrollSpyOptions): Map<number, boolean> {
  const [visibilityMap, setVisibilityMap] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibilityMap((prev) => {
          const next = new Map(prev);
          entries.forEach((entry) => {
            const index = refs.findIndex((ref) => ref.current === entry.target);
            if (index !== -1) {
              next.set(index, entry.isIntersecting);
            }
          });
          return next;
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Observe all refs
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [refs, rootMargin, threshold]);

  return visibilityMap;
}
