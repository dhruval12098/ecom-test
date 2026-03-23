import type React from "react";

declare namespace JSX {
  interface IntrinsicElements {
    "dotlottie-player": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string;
      background?: string;
      speed?: number | string;
      loop?: boolean;
      autoplay?: boolean;
    };
  }
}
