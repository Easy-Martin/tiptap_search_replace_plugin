// FindReplace.ts
import { Extension } from "@tiptap/core";
import { findReplacePlugin, findReplacePluginKey, FindReplaceAction } from "./findReplacePlugin";
import { TextSelection } from "@tiptap/pm/state";
import { nextTick } from "./util";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      find: (query: string) => ReturnType;

      findNext: () => ReturnType;

      findPrevious: () => ReturnType;

      replace: (replacement: string) => ReturnType;

      replaceAll: (replacement: string) => ReturnType;

      closeFindReplace: () => ReturnType;

      openFindReplace: () => ReturnType;

      toggleFindReplace: () => ReturnType;
    };
  }
  interface EditorEvents {
    // 声明你的自定义事件，格式：[事件名]: 参数类型
    "findReplace:toggleFindReplace": boolean;
    // 可以添加多个自定义事件
    // '自定义事件名2': 参数类型
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

  onTransaction({ editor, transaction }) {
    const meta = transaction.getMeta(findReplacePluginKey);
    if (meta?.action && (meta.action.type === "OPEN_PANEL" || meta.action.type === "CLOSE_PANEL")) {
      editor.emit("findReplace:toggleFindReplace", meta.action.type === "OPEN_PANEL");
    }
  },

  addKeyboardShortcuts() {
    const keyboard = this.options.openPanel;
    return {
      [keyboard]: ({ editor }) => {
        editor.chain().toggleFindReplace().run();
        return true;
      },
    };
  },

  addCommands() {
    return {
      find:
        (query: string) =>
        ({ tr, dispatch, state }) => {
          const pluginState = findReplacePluginKey.getState(state);

          if (!pluginState?.isPanelOpen) {
            return false;
          }

          if (dispatch) {
            const action: FindReplaceAction = { type: "FIND", query };
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },

      findNext:
        () =>
        ({ tr, dispatch, view, state }) => {
          const pluginState = findReplacePluginKey.getState(state);

          if (!pluginState?.isPanelOpen) {
            return false;
          }
          if (dispatch) {
            const action: FindReplaceAction = { type: "NAVIGATE", direction: 1 };
            // 传递 view 以便在插件中使用
            tr.setMeta("view", view);
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },

      findPrevious:
        () =>
        ({ tr, dispatch, view, state }) => {
          const pluginState = findReplacePluginKey.getState(state);

          if (!pluginState?.isPanelOpen) {
            return false;
          }
          if (dispatch) {
            const action: FindReplaceAction = { type: "NAVIGATE", direction: -1 };
            tr.setMeta("view", view);
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },

      replace:
        (replacement: string) =>
        ({ state, dispatch, editor }) => {
          const pluginState = findReplacePluginKey.getState(state);

          if (!pluginState?.isPanelOpen) {
            return false;
          }

          if (pluginState.activeMatchIndex === -1) {
            return false;
          }

          const { from, to } = pluginState.matches[pluginState.activeMatchIndex];

          // 验证缓存位置仍匹配查询文本，防止搜索后文档变动导致替换错位
          if (state.doc.textBetween(from, to).toLowerCase() !== pluginState.query.toLowerCase()) {
            return false;
          }

          const tr = state.tr;
          tr.insertText(replacement, from, to);

          const newSelection = TextSelection.create(tr.doc, to + (replacement.length - (to - from)));
          tr.setSelection(newSelection);

          if (dispatch) {
            dispatch(tr);
          }

          nextTick(() => editor.commands.find(pluginState.query));

          return true;
        },

      replaceAll:
        (replacement: string) =>
        ({ state, dispatch, editor }) => {
          const pluginState = findReplacePluginKey.getState(state);

          if (!pluginState?.isPanelOpen) {
            return false;
          }

          if (pluginState.matches.length === 0) {
            return false;
          }

          // 验证所有缓存位置仍匹配查询文本
          for (const { from, to } of pluginState.matches) {
            if (state.doc.textBetween(from, to).toLowerCase() !== pluginState.query.toLowerCase()) {
              return false;
            }
          }

          const tr = state.tr;
          // 从后往前替换，避免位置偏移
          const reversedMatches = [...pluginState.matches].reverse();
          reversedMatches.forEach(({ from, to }) => tr.insertText(replacement, from, to));

          if (dispatch) {
            dispatch(tr);
          }

          nextTick(() => editor.commands.find(""));

          return true;
        },
      closeFindReplace:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const action: FindReplaceAction = { type: "CLOSE_PANEL" };
            tr.setMeta(findReplacePluginKey, { action });
          }
          return true;
        },
      openFindReplace:
        () =>
        ({ tr, dispatch, editor }) => {
          if (dispatch) {
            const action: FindReplaceAction = { type: "OPEN_PANEL" };
            tr.setMeta(findReplacePluginKey, { action });
          }
          nextTick(() => editor.commands.find(""));
          return true;
        },
      toggleFindReplace:
        () =>
        ({ state, dispatch, tr }) => {
          const pluginState = findReplacePluginKey.getState(state);
          if (dispatch) {
            const action: FindReplaceAction = { type: pluginState?.isPanelOpen ? "CLOSE_PANEL" : "OPEN_PANEL" };
            tr.setMeta(findReplacePluginKey, { action });
          }

          return true;
        },
    };
  },
});

export { SearchReplacePlugin, findReplacePluginKey };
export type { FindReplaceAction };
