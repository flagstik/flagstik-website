/// <reference types="vite/client" />

// Allow importing SVG files as raw strings with ?raw suffix
declare module '*.svg?raw' {
  const content: string
  export default content
}
