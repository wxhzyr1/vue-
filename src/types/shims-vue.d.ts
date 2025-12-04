// src/types/shims-vue.d.ts (需要创建此文件)
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}