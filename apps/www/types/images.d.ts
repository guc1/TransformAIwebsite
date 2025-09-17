import * as React from "react";

declare module "*.svg" {
  const content: React.ComponentType<React.SVGProps<SVGSVGElement>> | string;
  export default content;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}
