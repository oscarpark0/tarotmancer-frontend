import { cn } from "../utils";
import React from "react";

const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#9932cc",
      shimmerSize = "0.1em",
      shimmerDuration = "2s",
      background = "rgba(26, 0, 51, 0.9)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={{
          "--shimmer-color": shimmerColor,
          "--bg": background,
          "--shimmer-size": shimmerSize,
          "--shimmer-duration": shimmerDuration,
        }}
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border-2 border-purple-500/50 px-6 py-3 text-white [background:var(--bg)] rounded-lg shadow-lg",
          "transform-gpu transition-all duration-300 ease-in-out hover:scale-105 active:translate-y-[2px] hover:shadow-purple-500/30 hover:shadow-xl",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 translate-x-[-100%] animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${shimmerColor}66, transparent)`,
              animation: `shimmer var(--shimmer-duration) infinite`,
            }}
          />
        </div>

        {/* Button content */}
        <div className="relative z-10">{children}</div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-lg bg-purple-500/20 blur-md" />
        </div>
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
