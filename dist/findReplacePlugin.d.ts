import { Plugin, PluginKey } from "prosemirror-state";
export type FindReplaceAction = {
    type: "FIND";
    query: string;
} | {
    type: "NAVIGATE";
    direction: 1 | -1;
} | {
    type: "REPLACE";
    replacement: string;
} | {
    type: "REPLACE_ALL";
    replacement: string;
} | {
    type: "CLOSE_PANEL";
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
