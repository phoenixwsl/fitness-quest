/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />

// 构建时注入的应用版本号(来自 package.json,见 vite.config define)。
declare const __APP_VERSION__: string
