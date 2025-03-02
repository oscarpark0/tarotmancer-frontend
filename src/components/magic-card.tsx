import { cn } from "../utils";
import React, { useEffect, useRef, ReactNode } from "react";

interface ContainerSize {
  w: number;
  h: number;
}

interface MagicContainerProps {
  children: ReactNode;
  className?: string;
}

const MagicContainer: React.FC<MagicContainerProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerSize = useRef<ContainerSize>({ w: 0, h: 0 });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    init();
    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, []);

  const init = (): void => {
    if (containerRef.current) {
      containerSize.current.w = containerRef.current.offsetWidth;
      containerSize.current.h = containerRef.current.offsetHeight;
    }
  };

  return (
    <div className={cn("relative h-screen w-full overflow-hidden", className)} ref={containerRef}>
      {children}
    </div>
  );
};

export { MagicContainer };