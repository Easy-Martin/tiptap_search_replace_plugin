# Tiptap 搜索替换插件

这是一个为 [Tiptap](https://tiptap.dev/) 编辑器开发的搜索和替换功能插件。该插件允许用户在 Tiptap 编辑器中搜索文本并进行替换操作。

## 功能特点

- 文本搜索功能
- 查找下一个/上一个匹配项
- 文本替换功能
- 与 Tiptap 编辑器无缝集成

## 安装

使用 npm:

```bash
npm install tiptap_search_replace_plugin
```

使用 yarn:

```bash
yarn add tiptap_search_replace_plugin
```

使用 pnpm:

```bash
pnpm add tiptap_search_replace_plugin
```

## 使用方法

### 基本用法

```typescript
import { Editor } from '@tiptap/core';
import { SearchReplacePlugin } from 'tiptap_search_replace_plugin';

const editor = new Editor({
  extensions: [
    // ... 其他扩展
    SearchReplacePlugin,
  ],
  // ... 其他配置
});

// 打开查找替换面板
editor.commands.openFindReplace();

// 关闭查找替换面板
editor.commands.closeFindReplace();

// 切换查找替换面板
editor.commands.toggleFindReplace();

// 搜索文本
editor.commands.find('要搜索的文本');

// 查找下一个匹配项
editor.commands.findNext();

// 查找上一个匹配项
editor.commands.findPrevious();

// 替换当前匹配项
editor.commands.replace('替换后的文本');

// 替换所有匹配项
editor.commands.replaceAll('替换后的文本');

```

## API

该插件提供以下命令：

- `find(text: string)`: 搜索指定文本
- `findNext()`: 查找下一个匹配项
- `findPrevious()`: 查找上一个匹配项
- `replace(text: string)`: 替换当前匹配项
- `replaceAll(text: string)`: 替换所有匹配项
- `toggleFindReplace()`: 打开或关闭查找替换面板
- `closeFindReplace()`: 关闭查找替换面板
- `openFindReplace()`: 打开查找替换面板

## Style

该插件没有默认的样式。你可以根据需要自定义样式,例如:

```less
.find-replace-highlight {
  background-color: yellow;
  &.find-replace-highlight-active {
    background-color: orange;
  }
}
```

## 开发

### 配置

你可以通过 `openPanel` 选项自定义打开查找替换面板的快捷键。默认值为 `Mod-f`（即按下 `Ctrl+f` 或 `Cmd+f`）。

```typescript
const editor = new Editor({
  extensions: [
    // ... 其他扩展
    SearchReplacePlugin.configure({
      openPanel: 'Mod-f',
    }),
  ],
  // ... 其他配置
});
```

### 实例

```typescript
import { Editor } from '@tiptap/core';
import { SearchReplacePlugin } from 'tiptap_search_replace_plugin';

const editor = new Editor({
  extensions: [
    // ... 其他扩展
    SearchReplacePlugin,
  ],
  // ... 其他配置
});
```

### Event

该插件触发以下事件：

- `findReplace:toggleFindReplace(isOpen: boolean)`: 查找替换面板打开或关闭时触发

你可以使用 `on` 方法监听这些事件，例如：

```jsx
useEffect(() => {
  editor.on("findReplace:toggleFindReplace", (isOpen) => updateState({ open: isOpen }));
  return () => {
    editor.off("findReplace:toggleFindReplace");
  };
}, []);
```



### 构建项目

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 许可证

MIT