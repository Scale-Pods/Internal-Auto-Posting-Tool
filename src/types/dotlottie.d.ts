// Type declarations for @dotlottie/player web component
declare namespace JSX {
  interface IntrinsicElements {
    'dotlottie-player': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        background?: string;
        speed?: string | number;
        loop?: boolean | string;
        autoplay?: boolean | string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}
