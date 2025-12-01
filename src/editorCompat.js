// Tiptap Integration Replacement for Quill in admin.js
// This module provides drop-in replacement functions for Quill usage

import { initializeTiptapEditor, getTiptapHTML, setTiptapHTML, destroyTiptapEditor } from './tiptap/index.js';

// Global editor instance
let editor = null;

// Initialize Tiptap (replaces initializeQuill)
export function initializeEditor() {
    if (editor || !document.getElementById('content-editor')) return editor;

    console.log('Initializing Tiptap editor...');

    editor = initializeTiptapEditor('content-editor', {
        onUpdate: () => {
            console.log('Editor content updated');
        }
    });

    return editor;
}

// Get editor content as HTML
export function getEditorHTML() {
    return editor ? getTiptapHTML() : '';
}

// Set editor content from HTML
export function setEditorHTML(html) {
    if (editor) {
        setTiptapHTML(html);
    }
}

// Clear editor content
export function clearEditor() {
    if (editor) {
        setEditorHTML('');
    }
}

// Destroy editor instance
export function destroyEditor() {
    if (editor) {
        destroyTiptapEditor();
        editor = null;
    }
}

// Get current editor instance
export function getEditor() {
    return editor;
}

// Compatibility layer - expose as window.editorAPI for existing code
if (typeof window !== 'undefined') {
    window.editorAPI = {
        initialize: initializeEditor,
        getHTML: getEditorHTML,
        setHTML: setEditorHTML,
        clear: clearEditor,
        destroy: destroyEditor,
        getEditor: getEditor
    };
}
