import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const setRef = useCallback((node: T | null) => {
    if (node) {
      ref.current = node;
      setSize({
        width: node.offsetWidth,
        height: node.offsetHeight,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const observer = new window.ResizeObserver(([entry]) => {
      if (entry && entry.contentRect) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [setRef, size] as const;
}
