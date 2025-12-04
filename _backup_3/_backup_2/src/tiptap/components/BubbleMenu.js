export function createBubbleMenu(editor) {
    const element = document.createElement('div');
    element.className = 'bubble-menu';
    element.innerHTML = `
    <button class="bubble-btn" data-action="bold">B</button>
    <button class="bubble-btn" data-action="italic">I</button>
    <button class="bubble-btn" data-action="underline">U</button>
    <button class="bubble-btn" data-action="strike">S</button>
    <span class="bubble-separator">|</span>
    <button class="bubble-btn" data-action="link">🔗</button>
    <button class="bubble-btn" data-action="code">&lt;/&gt;</button>
  `;

    // Attach listeners
    element.querySelector('[data-action="bold"]').addEventListener('click', () => editor.chain().focus().toggleBold().run());
    element.querySelector('[data-action="italic"]').addEventListener('click', () => editor.chain().focus().toggleItalic().run());
    element.querySelector('[data-action="underline"]').addEventListener('click', () => editor.chain().focus().toggleUnderline().run());
    element.querySelector('[data-action="strike"]').addEventListener('click', () => editor.chain().focus().toggleStrike().run());
    element.querySelector('[data-action="code"]').addEventListener('click', () => editor.chain().focus().toggleCode().run());

    element.querySelector('[data-action="link"]').addEventListener('click', () => {
        const url = prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    });

    return element;
}
