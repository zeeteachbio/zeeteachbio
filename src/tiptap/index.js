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

            // Use native selection to get the visual bounding box
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                // Calculate positions
                // Center horizontally
                const leftPos = rect.left + (rect.width / 2);

                // Default to above the selection
                let topPos = rect.top - 10; // 10px gap
                let transform = 'translate(-50%, -100%)';

                // Check if menu would go off-screen top
                // We need the menu dimensions, but it's not rendered yet if it was hidden.
                // Since we set display:flex above, we can measure it now.
                const menuHeight = bubbleMenuElement.offsetHeight;

                if (topPos - menuHeight < 10) {
                    // Not enough space above, flip to below
                    topPos = rect.bottom + 10;
                    transform = 'translate(-50%, 0)';
                }

                bubbleMenuElement.style.left = `${leftPos}px`;
                bubbleMenuElement.style.top = `${topPos}px`;
                bubbleMenuElement.style.transform = transform;
            } else {
                // Fallback to cursor pos if no range (shouldn't happen given from !== to check)
                const { view } = editor;
                const domRect = view.coordsAtPos(from);
                bubbleMenuElement.style.left = `${domRect.left}px`;
                bubbleMenuElement.style.top = `${domRect.top - 80}px`; // Increased offset fallback
                bubbleMenuElement.style.transform = 'none';
            }
        } else {
            bubbleMenuElement.style.display = 'none';
        }

        // Show table menu if in a table
        if (editor.isActive('table')) {
            const { view } = editor;

            // Find the table element in the DOM
            // view.domAtPos returns the node at the position. It might be a text node or an element.
            const domAtPos = view.domAtPos(from);
            const node = domAtPos.node;
            const tableElement = node.nodeType === 1 ? node.closest('table') : node.parentElement.closest('table');

            if (tableElement) {
                const rect = tableElement.getBoundingClientRect();

                tableMenuElement.style.display = 'block';

                // Center horizontally relative to the table
                // The menu has a fixed width or we can measure it
                const menuWidth = tableMenuElement.offsetWidth || 250; // Fallback if not rendered yet
                const menuHeight = tableMenuElement.offsetHeight || 200;

                let leftPos = rect.left + (rect.width / 2) - (menuWidth / 2);

                // Ensure it doesn't go off-screen left or right
                if (leftPos < 10) leftPos = 10;
                if (leftPos + menuWidth > window.innerWidth - 10) leftPos = window.innerWidth - menuWidth - 10;

                // Default to above the table
                let topPos = rect.top - menuHeight - 10; // 10px gap

                // Check if menu would go off-screen top
                if (topPos < 10) {
                    // Flip to below the table
                    topPos = rect.bottom + 10;
                }

                tableMenuElement.style.left = `${leftPos}px`;
                tableMenuElement.style.top = `${topPos}px`;
            } else {
                // Fallback if table element not found (rare)
                tableMenuElement.style.display = 'none';
            }
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
