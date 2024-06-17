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

const MagicCard = ({
  as: Tag = "div",
  className,
  children,
  size = 2000,
  spotlight = false,
  spotlightColor = "255, 255, 255",
  isolated = true,
  background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%)",
}) => {
  return (
    <Tag
      className={cn("group relative flex items-center justify-center z-10", className)}
      style={{ "--size": `${size}px`, "--bg": background, "--spotlight-color": spotlightColor, overflow: 'visible' }}
    >
      {children}
    </Tag>
  );
};

export { MagicCard, MagicContainer };