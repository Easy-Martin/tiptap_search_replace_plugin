"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReplacePluginKey = exports.SearchReplacePlugin = void 0;
// FindReplace.ts
const core_1 = require("@tiptap/core");
const findReplacePlugin_1 = require("./findReplacePlugin");
Object.defineProperty(exports, "findReplacePluginKey", { enumerable: true, get: function () { return findReplacePlugin_1.findReplacePluginKey; } });
const state_1 = require("@tiptap/pm/state");
const SearchReplacePlugin = core_1.Extension.create({
    name: "findReplace",
    addOptions() {
        return {
            openPanel: "Mod-f",
        };
    },
    addProseMirrorPlugins() {
        return [(0, findReplacePlugin_1.findReplacePlugin)()];
    },
    addCommands() {
        return {
            find: (query) => ({ tr, dispatch }) => {
                if (dispatch) {
                    const action = { type: "FIND", query };
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            findNext: () => ({ tr, dispatch, state }) => {
                var _a, _b;
                if (dispatch) {
                    const action = {
                        type: "NAVIGATE",
                        direction: 1,
                    };
                    // 传递 view 以便在插件中使用
                    tr.setMeta("view", (_b = (_a = state.plugins.find((p) => p.spec.key === findReplacePlugin_1.findReplacePluginKey)) === null || _a === void 0 ? void 0 : _a.spec) === null || _b === void 0 ? void 0 : _b.view);
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            findPrevious: () => ({ tr, dispatch, state }) => {
                var _a, _b;
                if (dispatch) {
                    const action = {
                        type: "NAVIGATE",
                        direction: -1,
                    };
                    tr.setMeta("view", (_b = (_a = state.plugins.find((p) => p.spec.key === findReplacePlugin_1.findReplacePluginKey)) === null || _a === void 0 ? void 0 : _a.spec) === null || _b === void 0 ? void 0 : _b.view);
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            replace: (replacement) => ({ state, dispatch }) => {
                // 1. 从插件状态中获取当前的匹配信息
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (!pluginState || pluginState.activeMatchIndex === -1) {
                    return false; // 如果没有激活的匹配项，则不执行任何操作
                }
                const { from, to } = pluginState.matches[pluginState.activeMatchIndex];
                // 2. 创建一个新的事务来执行文本替换
                const tr = state.tr;
                tr.insertText(replacement, from, to);
                // 3. 更新选区，将光标移动到替换后的文本末尾
                const newSelection = state_1.TextSelection.create(tr.doc, to + (replacement.length - (to - from)));
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
            replaceAll: (replacement) => ({ state, dispatch }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
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
            closeFindReplace: () => ({ tr, dispatch }) => {
                if (dispatch) {
                    const action = { type: "CLOSE_PANEL" };
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                setTimeout(() => {
                    this.editor.commands.find("");
                }, 0);
                return true;
            },
        };
    },
});
exports.SearchReplacePlugin = SearchReplacePlugin;
