/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origin of the blockchain node, e.g. https://democrazy-node.onrender.com.
   * Leave unset to call `/api` on the current origin.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
