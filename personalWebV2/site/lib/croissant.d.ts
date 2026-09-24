// Side-effect module: registers the <croissant-3d> custom element.
export {};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "croissant-3d": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { size?: string; force?: string; "label-font"?: string };
    }
  }
}
