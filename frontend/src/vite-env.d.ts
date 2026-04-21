/// <reference types="vite/client" />

// 声明CSS模块
declare module '*.css' {
  const content: any;
  export default content;
}

// 声明React Flow的CSS模块
declare module '@reactflow/core/dist/style.css' {
  const content: any;
  export default content;
}