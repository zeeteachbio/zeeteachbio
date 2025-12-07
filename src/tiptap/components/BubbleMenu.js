export function createBubbleMenu(editor) {
    const element = document.createElement('div');
    element.className = 'bubble-menu';
    element.style.flexDirection = 'column';
    element.style.alignItems = 'flex-start';

    element.innerHTML = `
    <div style="display: flex; gap: 4px; margin-bottom: 4px; align-items: center;">
        <button class="bubble-btn" data-action="bold" title="Bold">B</button>
        <button class="bubble-btn" data-action="italic" title="Italic">I</button>
        <button class="bubble-btn" data-action="underline" title="Underline">U</button>
        <button class="bubble-btn" data-action="strike" title="Strike">S</button>
        <span class="bubble-separator">|</span>
        <button class="bubble-btn" data-action="link" title="Link">🔗</button>
        <button class="bubble-btn" data-action="code" title="Code">&lt;/&gt;</button>
        <button class="bubble-btn" data-action="table" title="Insert Table">📅</button>
    </div>
    <div style="display: flex; gap: 4px; align-items: center;">
        <select class="bubble-select" data-action="heading" title="Heading Level">
            <option value="">Normal</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
            <option value="5">H5</option>
            <option value="6">H6</option>
        </select>
        <select class="bubble-select" data-action="size" title="Font Size">
            <option value="">Size</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
        </select>
        <select class="bubble-select" data-action="line-height" title="Line Height">
            <option value="">LH</option>
            <option value="1.0">1.0</option>
            <option value="1.2">1.2</option>
            <option value="1.5">1.5</option>
            <option value="1.8">1.8</option>
            <option value="2.0">2.0</option>
        </select>
        <select class="bubble-select" data-action="margin-bottom" title="Paragraph Spacing">
            <option value="">MB</option>
            <option value="0px">0</option>
            <option value="10px">10</option>
            <option value="20px">20</option>
            <option value="30px">30</option>
        </select>
    </div>
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

    element.querySelector('[data-action="table"]').addEventListener('click', () => {
        if (editor.isActive('table')) {
            // If already in table, maybe focus it or do nothing (menu appears automatically)
            return;
        }
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    });

    // Select Listeners
    const headingSelect = element.querySelector('[data-action="heading"]');
    headingSelect.addEventListener('change', (e) => {
        const level = e.target.value;
        if (level) {
            editor.chain().focus().setHeading({ level: parseInt(level) }).run();
        } else {
            editor.chain().focus().setParagraph().run();
        }
        // Don't reset value immediately so user sees what's selected? 
        // But selection updates might overwrite it. For now keep it simple.
    });

    const sizeSelect = element.querySelector('[data-action="size"]');
    sizeSelect.addEventListener('change', (e) => {
        const size = e.target.value;
        if (size) {
            editor.chain().focus().setFontSize(size).run();
        } else {
            editor.chain().focus().unsetFontSize().run();
        }
        e.target.value = ''; // Reset to allow re-selection
    });

    const lhSelect = element.querySelector('[data-action="line-height"]');
    lhSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            editor.chain().focus().updateAttributes('paragraph', { lineHeight: val }).run();
            editor.chain().focus().updateAttributes('heading', { lineHeight: val }).run();
        } else {
            editor.chain().focus().updateAttributes('paragraph', { lineHeight: null }).run();
            editor.chain().focus().updateAttributes('heading', { lineHeight: null }).run();
        }
        e.target.value = '';
    });

    const mbSelect = element.querySelector('[data-action="margin-bottom"]');
    mbSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            editor.chain().focus().updateAttributes('paragraph', { marginBottom: val }).run();
            editor.chain().focus().updateAttributes('heading', { marginBottom: val }).run();
        } else {
            editor.chain().focus().updateAttributes('paragraph', { marginBottom: null }).run();
            editor.chain().focus().updateAttributes('heading', { marginBottom: null }).run();
        }
        e.target.value = '';
    });

    return element;
}
