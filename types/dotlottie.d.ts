import type React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "dotlottie-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        background?: string;
        speed?: string | number;
        loop?: boolean | string;
        autoplay?: boolean | string;
        direction?: string;
        mode?: string;
      };
    }
  }
}

export {};
