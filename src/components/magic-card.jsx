import { cn } from "../utils";
import { useEffect, useRef } from "react";

const MagicContainer = ({ children, className }) => {
  const containerRef = useRef(null);
  const containerSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    init();
    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, []);

  const init = () => {
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


export {MagicContainer };