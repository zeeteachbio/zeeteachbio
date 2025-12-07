import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { CustomTableCell, CustomTableHeader } from './extensions/CustomTableExtensions.js';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { History } from '@tiptap/extension-history';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { FontSize } from './extensions/FontSize.js';
import { Spacing } from './extensions/Spacing.js';
import { InfoBox, WarningBox, SuccessBox, TipBox, BiologyBox } from './extensions/CustomBlocks.js';

export function createEditor(element, options = {}) {
    const editor = new Editor({
        element: element,
        extensions: [
            // StarterKit includes: Bold, Italic, Strike, Code, Paragraph, Text, Doc,
            // Heading, Blockquote, CodeBlock, HorizontalRule, BulletList, OrderedList,
            // ListItem, History, Dropcursor, Gapcursor, HardBreak
            // We disable Link and Underline because we add them separately with custom config
            StarterKit.configure({
                link: false,  // Disable to avoid duplicate with custom Link below
                underline: false,  // Disable to avoid duplicate with custom Underline below
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            // Add extensions NOT in StarterKit
            Underline,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
                cellMinWidth: 50,
            }),
            TableRow,
            CustomTableCell,
            CustomTableHeader,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            CharacterCount,
            Placeholder.configure({
                placeholder: 'Start writing your article...',
            }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            FontSize,
            Spacing,
            Subscript,
            Superscript,
            InfoBox,
            WarningBox,
            SuccessBox,
            TipBox,
            BiologyBox,
        ],
        content: options.content || '',
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
                spellcheck: 'true',
            },
        },
        onUpdate: options.onUpdate || (() => { }),
    });

    return editor;
}

export function getHTML(editor) {
    return editor.getHTML();
}

export function setHTML(editor, html) {
    editor.commands.setContent(html);
}

export function destroyEditor(editor) {
    if (editor) {
        editor.destroy();
    }
}
