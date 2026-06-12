import React, { useCallback, useLayoutEffect, useRef, useState } from "react";

interface CenteredScrollRowProps {
  children: React.ReactNode;
  className?: string;
  gapClass?: string;
  innerClassName?: string;
  onScrollRef?: (el: HTMLDivElement | null) => void;
}

export const CenteredScrollRow: React.FC<CenteredScrollRowProps> = ({
  children,
  className = "",
  gapClass = "gap-5 sm:gap-6",
  innerClassName = "",
  onScrollRef,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  const setScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      onScrollRef?.(el);
    },
    [onScrollRef],
  );

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const inner = innerRef.current;
    if (!scroll || !inner) return;
    const update = () =>
      setOverflowing(inner.scrollWidth > scroll.clientWidth + 2);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(scroll);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div className="relative w-full">
      <div
        ref={setScrollRef}
        className={`overflow-x-auto overflow-y-visible pb-4 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-none ${className}`}
      >
        <div
          ref={innerRef}
          className={`flex py-1 ${gapClass} ${innerClassName}`}
          style={{
            justifyContent: overflowing ? "flex-start" : "center",
            boxSizing: "border-box",
            width: "max-content",
            minWidth: "100%",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};