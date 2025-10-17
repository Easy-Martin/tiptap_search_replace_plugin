// findReplacePlugin.ts
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { Node } from "prosemirror-model";
import { nextTick } from "./util";

// --- 类型定义 ---
export type FindReplaceAction =
  | { type: "FIND"; query: string }
  | { type: "NAVIGATE"; direction: 1 | -1 }
  | { type: "REPLACE"; replacement: string }
  | { type: "REPLACE_ALL"; replacement: string }
  | { type: "CLOSE_PANEL" }
  | { type: "OPEN_PANEL" };

export interface FindReplaceState {
  query: string;
  matches: Array<{ from: number; to: number }>;
  activeMatchIndex: number;
  isPanelOpen: boolean;
}

export const findReplacePluginKey = new PluginKey<FindReplaceState>("findReplace");

const HIGHLIGHT_BASE_CLASS = "find-replace-highlight";
export const HIGHLIGHT_CLASS = HIGHLIGHT_BASE_CLASS;
export const ACTIVE_HIGHLIGHT_CLASS = `${HIGHLIGHT_BASE_CLASS}-active`;

export const findReplacePlugin = () => {
  return new Plugin<FindReplaceState>({
    key: findReplacePluginKey,

    state: {
      init(): FindReplaceState {
        return { query: "", matches: [], activeMatchIndex: -1, isPanelOpen: false };
      },
      apply(tr, prevState) {
        const meta = tr.getMeta(findReplacePluginKey);
        const action: FindReplaceAction | undefined = meta?.action;

        if (!action) {
          return prevState;
        }

        switch (action.type) {
          case "FIND": {
            const { query } = action;
            let matches = [] as Array<{ from: number; to: number }>;
            if (query) {
              matches = findMatchesInDocument(tr.doc, query);
            }
            return { ...prevState, query, matches, activeMatchIndex: matches.length > 0 ? 0 : -1 };
          }

          case "NAVIGATE": {
            const { direction } = action;
            if (prevState.matches.length === 0) return prevState;

            let newIndex = prevState.activeMatchIndex + direction;
            if (newIndex < 0) newIndex = prevState.matches.length - 1;
            if (newIndex >= prevState.matches.length) newIndex = 0;

            // 滚动到新匹配项
            nextTick(() => {
              const view = tr.getMeta("view") as EditorView | undefined;
              if (!view) return;
              const match = prevState.matches[newIndex];

              // --- 这是修复后的正确代码 ---
              const $from = view.state.doc.resolve(match.from);
              const $to = view.state.doc.resolve(match.to);
              const newSelection = new TextSelection($from, $to);
              view.dispatch(view.state.tr.setSelection(newSelection));

              // 延迟执行滚动操作，确保DOM已更新
              setTimeout(() => {
                const element = document.querySelector(`.${ACTIVE_HIGHLIGHT_CLASS}`);
                element && element.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100); // 增加延迟时间确保DOM更新完成
            });

            return { ...prevState, activeMatchIndex: newIndex };
          }
          case "REPLACE": {
            return { ...prevState };
          }

          case "REPLACE_ALL": {
            return { ...prevState };
          }

          case "OPEN_PANEL":
            return { ...prevState, isPanelOpen: true };

          case "CLOSE_PANEL":
            return { ...prevState, isPanelOpen: false };
        }
      },
    },

    props: {
      decorations(state) {
        const pluginState = findReplacePluginKey.getState(state);

        if (!pluginState?.isPanelOpen) {
          return DecorationSet.empty;
        }
        if (!pluginState || !pluginState.query || pluginState.matches.length === 0) {
          return DecorationSet.empty;
        }
        const decorations = pluginState.matches.map((match, index) => {
          const isActive = index === pluginState.activeMatchIndex;
          const classname = isActive ? `${HIGHLIGHT_CLASS} ${ACTIVE_HIGHLIGHT_CLASS}` : HIGHLIGHT_CLASS;
          return Decoration.inline(match.from, match.to, { class: classname }, { inclusive: true });
        });

        return DecorationSet.create(state.doc, decorations);
      },

      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const pluginState = findReplacePluginKey.getState(view.state);
        if (pluginState?.isPanelOpen && event.key === "Escape") {
          view.dispatch(view.state.tr.setMeta(findReplacePluginKey, { action: { type: "CLOSE_PANEL" } }));
          return true;
        }
        return false;
      },
    },
  });
};

// --- 辅助函数 ---

/**
 * 在文档中查找所有非重叠的文本匹配项
 * @param doc ProseMirror 文档
 * @param query 要查找的文本
 * @returns 匹配项的位置数组 { from, to }
 */
function findMatchesInDocument(doc: Node, query: string): Array<{ from: number; to: number }> {
  const matches: Array<{ from: number; to: number }> = [];
  if (!query || query.trim() === "") return matches;

  const queryLower = query.toLowerCase();

  // 使用一个更健壮的方法来遍历文档并查找匹配
  // 这个方法会递归遍历所有文本节点
  doc.descendants((node, pos) => {
    if (node.isText) {
      const text = node.text || "";
      const textLower = text.toLowerCase();
      let startIndex = 0;
      let index: number;

      while ((index = textLower.indexOf(queryLower, startIndex)) !== -1) {
        const from = pos + index;
        const to = from + query.length;
        matches.push({ from, to });
        startIndex = index + query.length;
      }
    }
    // 返回 true 以继续遍历子节点
    return true;
  });

  return matches;
}
