/// <reference types="vite/client" />

// Declare module for GLB file imports with URL suffix
declare module '*.glb?url' {
  const src: string;
  export default src;
}
