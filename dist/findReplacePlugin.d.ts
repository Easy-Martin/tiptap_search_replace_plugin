import { Plugin, PluginKey } from "@tiptap/pm/state";
export type FindReplaceAction = {
    type: "FIND";
    query: string;
} | {
    type: "NAVIGATE";
    direction: 1 | -1;
} | {
    type: "CLOSE_PANEL";
} | {
    type: "OPEN_PANEL";
};
export interface FindReplaceState {
    query: string;
    matches: Array<{
        from: number;
        to: number;
    }>;
    activeMatchIndex: number;
    isPanelOpen: boolean;
}
export declare const findReplacePluginKey: PluginKey<FindReplaceState>;
export declare const HIGHLIGHT_CLASS = "find-replace-highlight";
export declare const ACTIVE_HIGHLIGHT_CLASS = "find-replace-highlight-active";
export declare const findReplacePlugin: () => Plugin<FindReplaceState>;
