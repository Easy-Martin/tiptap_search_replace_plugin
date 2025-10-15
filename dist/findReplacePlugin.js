"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReplacePlugin = exports.ACTIVE_HIGHLIGHT_CLASS = exports.HIGHLIGHT_CLASS = exports.findReplacePluginKey = void 0;
// findReplacePlugin.ts
const prosemirror_state_1 = require("prosemirror-state");
const prosemirror_view_1 = require("prosemirror-view");
// --- 插件实现 ---
exports.findReplacePluginKey = new prosemirror_state_1.PluginKey("findReplace");
// 生成随机 CSS 类名以避免冲突
const HIGHLIGHT_BASE_CLASS = "find-replace-highlight";
exports.HIGHLIGHT_CLASS = HIGHLIGHT_BASE_CLASS;
exports.ACTIVE_HIGHLIGHT_CLASS = `${HIGHLIGHT_BASE_CLASS}-active`;
const findReplacePlugin = () => {
    return new prosemirror_state_1.Plugin({
        key: exports.findReplacePluginKey,
        state: {
            init() {
                return {
                    query: "",
                    matches: [],
                    activeMatchIndex: -1,
                    isPanelOpen: false,
                };
            },
            apply(tr, prevState, state) {
                const meta = tr.getMeta(exports.findReplacePluginKey);
                const action = meta === null || meta === void 0 ? void 0 : meta.action;
                if (!action) {
                    return prevState;
                }
                switch (action.type) {
                    case "FIND": {
                        const { query } = action;
                        const matches = findMatchesInDocument(tr.doc, query);
                        return {
                            ...prevState,
                            query,
                            matches,
                            activeMatchIndex: matches.length > 0 ? 0 : -1,
                        };
                    }
                    case "NAVIGATE": {
                        const { direction } = action;
                        if (prevState.matches.length === 0)
                            return prevState;
                        let newIndex = prevState.activeMatchIndex + direction;
                        if (newIndex < 0)
                            newIndex = prevState.matches.length - 1;
                        if (newIndex >= prevState.matches.length)
                            newIndex = 0;
                        // 滚动到新匹配项
                        setTimeout(() => {
                            const view = tr.getMeta("view");
                            if (view) {
                                const match = prevState.matches[newIndex];
                                // --- 这是修复后的正确代码 ---
                                const $from = view.state.doc.resolve(match.from);
                                const $to = view.state.doc.resolve(match.to);
                                const newSelection = new prosemirror_state_1.TextSelection($from, $to);
                                view.dispatch(view.state.tr.setSelection(newSelection));
                                // --- 修复结束 ---
                                // 延迟执行滚动操作，确保DOM已更新
                                setTimeout(() => {
                                    const element = document.querySelector(`.${exports.ACTIVE_HIGHLIGHT_CLASS}`);
                                    if (element) {
                                        // 使用更可靠的滚动设置
                                        element.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center", // 改为center以确保元素在视图中央
                                        });
                                    }
                                }, 100); // 增加延迟时间确保DOM更新完成
                            }
                        }, 0);
                        return {
                            ...prevState,
                            activeMatchIndex: newIndex,
                        };
                    }
                    case "REPLACE": {
                        return {
                            ...prevState,
                        };
                    }
                    case "REPLACE_ALL": {
                        return {
                            ...prevState,
                        };
                    }
                    case "CLOSE_PANEL":
                        return {
                            ...prevState,
                            isPanelOpen: false,
                        };
                }
            },
        },
        props: {
            decorations(state) {
                const pluginState = exports.findReplacePluginKey.getState(state);
                if (!pluginState ||
                    !pluginState.query ||
                    pluginState.matches.length === 0) {
                    return prosemirror_view_1.DecorationSet.empty;
                }
                const decorations = pluginState.matches.map((match, index) => {
                    const isActive = index === pluginState.activeMatchIndex;
                    return prosemirror_view_1.Decoration.inline(match.from, match.to, {
                        class: isActive
                            ? `${exports.HIGHLIGHT_CLASS} ${exports.ACTIVE_HIGHLIGHT_CLASS}`
                            : exports.HIGHLIGHT_CLASS,
                    }, { inclusive: true });
                });
                return prosemirror_view_1.DecorationSet.create(state.doc, decorations);
            },
            handleKeyDown(view, event) {
                const pluginState = exports.findReplacePluginKey.getState(view.state);
                if ((pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen) && event.key === "Escape") {
                    view.dispatch(view.state.tr.setMeta(exports.findReplacePluginKey, {
                        action: { type: "CLOSE_PANEL" },
                    }));
                    return true;
                }
                return false;
            },
        },
    });
};
exports.findReplacePlugin = findReplacePlugin;
// --- 辅助函数 ---
/**
 * 在文档中查找所有非重叠的文本匹配项
 * @param doc ProseMirror 文档
 * @param query 要查找的文本
 * @returns 匹配项的位置数组 { from, to }
 */
function findMatchesInDocument(doc, query) {
    const matches = [];
    if (!query || query.trim() === "")
        return matches;
    const queryLower = query.toLowerCase();
    // 使用一个更健壮的方法来遍历文档并查找匹配
    // 这个方法会递归遍历所有文本节点
    doc.descendants((node, pos) => {
        if (node.isText) {
            const text = node.text || "";
            const textLower = text.toLowerCase();
            let startIndex = 0;
            let index;
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
