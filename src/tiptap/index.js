import { createEditor, getHTML, setHTML, destroyEditor } from './editor.js';
import { createToolbar } from './components/Toolbar.js';
import { createBubbleMenu } from './components/BubbleMenu.js';
import { createTableMenu } from './components/TableMenu.js';

let currentEditor = null;
let bubbleMenuElement = null;
let tableMenuElement = null;

export function initializeTiptapEditor(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return null;
    }

    // Clear existing content
    container.innerHTML = '';

    // Create editor wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'tiptap-wrapper';
    wrapper.style.position = 'relative';

    // Create editor element
    const editorElement = document.createElement('div');
    editorElement.className = 'tiptap-editor';

    // Initialize editor
    const editor = createEditor(editorElement, {
        content: options.content || '',
        onUpdate: ({ editor }) => {
            if (options.onUpdate) {
                options.onUpdate(editor);
            }
        },
    });

    // Create toolbar
    const toolbar = createToolbar(editor);

    // Create bubble menu (for text selection)
    bubbleMenuElement = createBubbleMenu(editor);
    bubbleMenuElement.style.display = 'none';
    bubbleMenuElement.style.position = 'fixed';
    bubbleMenuElement.style.zIndex = '9999';

    // Create table menu
    tableMenuElement = createTableMenu(editor);
    tableMenuElement.style.display = 'none';
    tableMenuElement.style.position = 'fixed';
    tableMenuElement.style.zIndex = '9999';

    // Assemble the editor
    wrapper.appendChild(toolbar);
    wrapper.appendChild(editorElement);
    container.appendChild(wrapper);

    // Add menus to body (not inside wrapper)
    document.body.appendChild(bubbleMenuElement);
    document.body.appendChild(tableMenuElement);

    // Setup selection change listener for bubble menu
    editor.on('selectionUpdate', ({ editor }) => {
        const { from, to } = editor.state.selection;

        // Show bubble menu if text is selected
        if (from !== to) {
            const { view } = editor;
            const domRect = view.coordsAtPos(from);

            bubbleMenuElement.style.display = 'flex';
            bubbleMenuElement.style.left = `${domRect.left}px`;
            bubbleMenuElement.style.top = `${domRect.top - 50}px`;
        } else {
            bubbleMenuElement.style.display = 'none';
        }

        // Show table menu if in a table
        if (editor.isActive('table')) {
            const { view } = editor;
            const domRect = view.coordsAtPos(from);

            tableMenuElement.style.display = 'block';

            // Position menu further away from cursor to avoid interference
            let topPos = domRect.top - 350;
            let leftPos = domRect.left;

            // Adjust if menu would overflow viewport
            const menuWidth = 250; // approximate menu width
            if (leftPos + menuWidth > window.innerWidth) {
                leftPos = window.innerWidth - menuWidth - 20;
            }

            tableMenuElement.style.left = `${leftPos}px`;
            tableMenuElement.style.top = `${topPos}px`;
        } else {
            tableMenuElement.style.display = 'none';
        }
    });

    currentEditor = editor;
    return editor;
}

export function getTiptapHTML() {
    if (!currentEditor) {
        console.warn('No active Tiptap editor found');
        return '';
    }
    return getHTML(currentEditor);
}

export function setTiptapHTML(html) {
    if (!currentEditor) {
        console.warn('No active Tiptap editor found');
        return;
    }
    setHTML(currentEditor, html);
}

export function destroyTiptapEditor() {
    if (currentEditor) {
        destroyEditor(currentEditor);
        currentEditor = null;
    }

    // Clean up menu elements
    if (bubbleMenuElement && bubbleMenuElement.parentNode) {
        bubbleMenuElement.parentNode.removeChild(bubbleMenuElement);
        bubbleMenuElement = null;
    }
    if (tableMenuElement && tableMenuElement.parentNode) {
        tableMenuElement.parentNode.removeChild(tableMenuElement);
        tableMenuElement = null;
    }
}

export function getCurrentEditor() {
    return currentEditor;
}
