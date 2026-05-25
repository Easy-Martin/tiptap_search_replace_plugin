"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findReplacePluginKey = exports.SearchReplacePlugin = void 0;
// FindReplace.ts
const core_1 = require("@tiptap/core");
const findReplacePlugin_1 = require("./findReplacePlugin");
Object.defineProperty(exports, "findReplacePluginKey", { enumerable: true, get: function () { return findReplacePlugin_1.findReplacePluginKey; } });
const state_1 = require("@tiptap/pm/state");
const util_1 = require("./util");
const SearchReplacePlugin = core_1.Extension.create({
    name: "findReplace",
    addOptions() {
        return { openPanel: "Mod-f" };
    },
    addProseMirrorPlugins() {
        return [(0, findReplacePlugin_1.findReplacePlugin)()];
    },
    onTransaction({ editor, transaction }) {
        const meta = transaction.getMeta(findReplacePlugin_1.findReplacePluginKey);
        if ((meta === null || meta === void 0 ? void 0 : meta.action) && (meta.action.type === "OPEN_PANEL" || meta.action.type === "CLOSE_PANEL")) {
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
            find: (query) => ({ tr, dispatch, state }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (!(pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen)) {
                    return false;
                }
                if (dispatch) {
                    const action = { type: "FIND", query };
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            findNext: () => ({ tr, dispatch, view, state }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (!(pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen)) {
                    return false;
                }
                if (dispatch) {
                    const action = { type: "NAVIGATE", direction: 1 };
                    // 传递 view 以便在插件中使用
                    tr.setMeta("view", view);
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            findPrevious: () => ({ tr, dispatch, view, state }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (!(pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen)) {
                    return false;
                }
                if (dispatch) {
                    const action = { type: "NAVIGATE", direction: -1 };
                    tr.setMeta("view", view);
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            replace: (replacement) => ({ state, dispatch, editor }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (!(pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen)) {
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
                const newSelection = state_1.TextSelection.create(tr.doc, to + (replacement.length - (to - from)));
                tr.setSelection(newSelection);
                if (dispatch) {
                    dispatch(tr);
                }
                (0, util_1.nextTick)(() => editor.commands.find(pluginState.query));
                return true;
            },
            replaceAll: (replacement) => ({ state, dispatch, editor }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (!(pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen)) {
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
                (0, util_1.nextTick)(() => editor.commands.find(""));
                return true;
            },
            closeFindReplace: () => ({ tr, dispatch }) => {
                if (dispatch) {
                    const action = { type: "CLOSE_PANEL" };
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
            openFindReplace: () => ({ tr, dispatch, editor }) => {
                if (dispatch) {
                    const action = { type: "OPEN_PANEL" };
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                (0, util_1.nextTick)(() => editor.commands.find(""));
                return true;
            },
            toggleFindReplace: () => ({ state, dispatch, tr }) => {
                const pluginState = findReplacePlugin_1.findReplacePluginKey.getState(state);
                if (dispatch) {
                    const action = { type: (pluginState === null || pluginState === void 0 ? void 0 : pluginState.isPanelOpen) ? "CLOSE_PANEL" : "OPEN_PANEL" };
                    tr.setMeta(findReplacePlugin_1.findReplacePluginKey, { action });
                }
                return true;
            },
        };
    },
});
exports.SearchReplacePlugin = SearchReplacePlugin;
