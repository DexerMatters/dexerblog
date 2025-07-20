import markdownit from 'markdown-it';
import markdownitKatex from '@vscode/markdown-it-katex';
import markdownitHightlight from 'markdown-it-highlightjs';
// @ts-ignore-next-line
import markdownItTextualUml from 'markdown-it-textual-uml';

const md = markdownit({
  html: true,
  linkify: true,
});


// @ts-ignore-next-line
markdownitKatex.default(md);
markdownitHightlight(md);
markdownItTextualUml(md);

export function renderMarkdown(content: string): string {
  return md.render(content);
}