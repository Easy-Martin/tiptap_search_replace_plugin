// 导出插件
export { SearchReplacePlugin } from './plugin';
export * from './findReplacePlugin';

// 默认导出
export default {
  SearchReplacePlugin: () => import('./plugin').then(m => m.SearchReplacePlugin),
};