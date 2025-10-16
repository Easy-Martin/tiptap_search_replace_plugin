// FindReplace.ts
import { Extension } from "@tiptap/core";
import { findReplacePlugin, findReplacePluginKey, FindReplaceAction } from "./findReplacePlugin";
import { TextSelection } from "@tiptap/pm/state";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      find: (query: string) => ReturnType;

      findNext: () => ReturnType;

      findPrevious: () => ReturnType;

      replace: (replacement: string) => ReturnType;

      replaceAll: (replacement: string) => ReturnType;

      closeFindReplace: () => ReturnType;
    };
  }
}

const SearchReplacePlugin = Extension.create({
  name: "findReplace",

  addOptions() {
    return { openPanel: "Mod-f" };
  },

  addProseMirrorPlugins() {
    return [findReplacePlugin()];
  },

  addCommands() {
    return {
      find:
        (query: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const action: FindReplaceAction = { type: "FIND", query };
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },

      findNext:
        () =>
        ({ tr, dispatch, view }) => {
          if (dispatch) {
            const action: FindReplaceAction = {
              type: "NAVIGATE",
              direction: 1,
            };
            tr;
            // 传递 view 以便在插件中使用
            tr.setMeta("view", view);
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },

      findPrevious:
        () =>
        ({ tr, dispatch, view }) => {
          if (dispatch) {
            const action: FindReplaceAction = {
              type: "NAVIGATE",
              direction: -1,
            };
            tr.setMeta("view", view);
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },

      replace:
        (replacement: string) =>
        ({ state, dispatch }) => {
          // 1. 从插件状态中获取当前的匹配信息
          const pluginState = findReplacePluginKey.getState(state);
          if (!pluginState || pluginState.activeMatchIndex === -1) {
            return false; // 如果没有激活的匹配项，则不执行任何操作
          }

          const { from, to } = pluginState.matches[pluginState.activeMatchIndex];

          // 2. 创建一个新的事务来执行文本替换
          const tr = state.tr;
          tr.insertText(replacement, from, to);

          // 3. 更新选区，将光标移动到替换后的文本末尾
          const newSelection = TextSelection.create(tr.doc, to + (replacement.length - (to - from)));
          tr.setSelection(newSelection);

          // 4. Dispatch 这个事务，这将更新编辑器的文档和视图
          if (dispatch) {
            dispatch(tr);
          }

          // 5. (异步) 替换完成后，立即使用相同的查询词重新查找
          // 使用 setTimeout 确保在 DOM 更新后再执行，避免竞态条件
          setTimeout(() => {
            this.editor.commands.find(pluginState.query);
          }, 0);

          return true;
        },

      // ... replaceAll 命令也需要类似处理，但逻辑更简单
      replaceAll:
        (replacement: string) =>
        ({ state, dispatch }) => {
          const pluginState = findReplacePluginKey.getState(state);
          if (!pluginState || pluginState.matches.length === 0) {
            return false;
          }

          const tr = state.tr;
          // 从后往前替换，避免位置偏移
          const reversedMatches = [...pluginState.matches].reverse();
          reversedMatches.forEach(({ from, to }) => {
            tr.insertText(replacement, from, to);
          });

          if (dispatch) {
            dispatch(tr);
          }

          // 替换全部后，清空查找状态
          setTimeout(() => {
            this.editor.commands.find("");
          }, 0);

          return true;
        },

      closeFindReplace:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const action: FindReplaceAction = { type: "CLOSE_PANEL" };
            tr.setMeta(findReplacePluginKey, { action });
          }

          setTimeout(() => {
            this.editor.commands.find("");
          }, 0);
          return true;
        },
    };
  },
});

export { SearchReplacePlugin, findReplacePluginKey };
export type { FindReplaceAction };
