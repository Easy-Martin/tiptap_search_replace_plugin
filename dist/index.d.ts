import { Extension } from "@tiptap/core";
import { findReplacePluginKey, FindReplaceAction } from "./findReplacePlugin";
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
declare const SearchReplacePlugin: Extension<any, any>;
export { SearchReplacePlugin, findReplacePluginKey };
export type { FindReplaceAction };
