export function createToolbar(editor) {
  const toolbar = document.createElement('div');
  toolbar.className = 'tiptap-toolbar';
  toolbar.innerHTML = `
    <div class="toolbar-group">
      <select class="toolbar-select" id="heading-select">
        <option value="">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="5">Heading 5</option>
        <option value="6">Heading 6</option>
      </select>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <select class="toolbar-select" id="font-family-select">
        <option value="">Default</option>
        <option value="Mirza">Mirza</option>
        <option value="Roboto">Roboto</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
        <option value="Courier New">Courier New</option>
        <option value="Katibeh">Katibeh</option>
        <option value="Lateef">Lateef</option>
      </select>

      <select class="toolbar-select" id="font-size-select">
        <option value="">Size</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px (Default)</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="28px">28px</option>
        <option value="32px">32px</option>
      </select>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="bold-btn" title="Bold (Ctrl+B)">
        <strong>B</strong>
      </button>
      <button class="toolbar-btn" id="italic-btn" title="Italic (Ctrl+I)">
        <em>I</em>
      </button>
      <button class="toolbar-btn" id="underline-btn" title="Underline (Ctrl+U)">
        <u>U</u>
      </button>
      <button class="toolbar-btn" id="strike-btn" title="Strike">
        <s>S</s>
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="subscript-btn" title="Subscript">
        X<sub>2</sub>
      </button>
      <button class="toolbar-btn" id="superscript-btn" title="Superscript">
        X<sup>2</sup>
      </button>
      <button class="toolbar-btn" id="code-btn" title="Inline Code">
        &lt;/&gt;
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <input type="color" class="toolbar-color" id="text-color" title="Text Color">
      <input type="color" class="toolbar-color" id="highlight-color" title="Highlight">
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="align-left-btn" title="Align Left">
        ␣≡
      </button>
      <button class="toolbar-btn" id="align-center-btn" title="Align Center">
        ≡
      </button>
      <button class="toolbar-btn" id="align-right-btn" title="Align Right">
        ≡␣
      </button>
      <button class="toolbar-btn" id="align-justify-btn" title="Justify">
        ≣
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="bullet-list-btn" title="Bullet List">
        •
      </button>
      <button class="toolbar-btn" id="ordered-list-btn" title="Numbered List">
        1.
      </button>
      <button class="toolbar-btn" id="task-list-btn" title="Task List">
        ☐
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="blockquote-btn" title="Blockquote">
        "
      </button>
      <button class="toolbar-btn" id="code-block-btn" title="Code Block">
        { }
      </button>
      <button class="toolbar-btn" id="hr-btn" title="Horizontal Rule">
        —
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="link-btn" title="Add Link">
        🔗
     </button>
      <button class="toolbar-btn" id="image-btn" title="Add Image">
        🖼️
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <select class="toolbar-select" id="table-select">
        <option value="">Table</option>
        <option value="insert">Insert Table</option>
        <option value="addRowBefore">Add Row Above</option>
        <option value="addRowAfter">Add Row Below</option>
        <option value="deleteRow">Delete Row</option>
        <option value="addColumnBefore">Add Column Left</option>
        <option value="addColumnAfter">Add Column Right</option>
        <option value="deleteColumn">Delete Column</option>
        <option value="mergeCells">Merge Cells</option>
        <option value="splitCell">Split Cell</option>
        <option value="toggleHeader">Toggle Header Row</option>
        <option value="cellBackground">Cell Background Color</option>
        <option value="cellBorder">Cell Border Style</option>
        <option value="deleteTable">Delete Table</option>
      </select>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <select class="toolbar-select" id="block-select">
        <option value="">Custom Blocks</option>
        <option value="info">Info Box</option>
        <option value="warning">Warning Box</option>
        <option value="success">Success Box</option>
        <option value="tip">Tip Box</option>
        <option value="biology">Biology Box</option>
      </select>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button class="toolbar-btn" id="undo-btn" title="Undo (Ctrl+Z)">
        ↶
      </button>
      <button class="toolbar-btn" id="redo-btn" title="Redo (Ctrl+Y)">
        ↷
      </button>
    </div>
  `;

  // Attach event listeners
  attachToolbarListeners(toolbar, editor);

  return toolbar;
}

function attachToolbarListeners(toolbar, editor) {
  // Heading select
  toolbar.querySelector('#heading-select').addEventListener('change', (e) => {
    const level = e.target.value;
    if (level) {
      editor.chain().focus().setHeading({ level: parseInt(level) }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
    e.target.value = '';
  });

  // Font family
  toolbar.querySelector('#font-family-select').addEventListener('change', (e) => {
    const font = e.target.value;
    if (font) {
      editor.chain().focus().setFontFamily(font).run();
    } else {
      editor.chain().focus().unsetFontFamily().run();
    }
  });

  // Font size
  toolbar.querySelector('#font-size-select').addEventListener('change', (e) => {
    const size = e.target.value;
    if (size) {
      editor.chain().focus().setFontSize(size).run();
    } else {
      editor.chain().focus().unsetFontSize().run();
    }
    // Reset dropdown to prevent selection bug
    e.target.value = '';
  });

  // Text formatting
  toolbar.querySelector('#bold-btn').addEventListener('click', () => editor.chain().focus().toggleBold().run());
  toolbar.querySelector('#italic-btn').addEventListener('click', () => editor.chain().focus().toggleItalic().run());
  toolbar.querySelector('#underline-btn').addEventListener('click', () => editor.chain().focus().toggleUnderline().run());
  toolbar.querySelector('#strike-btn').addEventListener('click', () => editor.chain().focus().toggleStrike().run());
  toolbar.querySelector('#subscript-btn').addEventListener('click', () => editor.chain().focus().toggleSubscript().run());
  toolbar.querySelector('#superscript-btn').addEventListener('click', () => editor.chain().focus().toggleSuperscript().run());
  toolbar.querySelector('#code-btn').addEventListener('click', () => editor.chain().focus().toggleCode().run());

  // Colors
  toolbar.querySelector('#text-color').addEventListener('input', (e) => {
    editor.chain().focus().setColor(e.target.value).run();
  });

  toolbar.querySelector('#highlight-color').addEventListener('input', (e) => {
    editor.chain().focus().setHighlight({ color: e.target.value }).run();
  });

  // Alignment
  toolbar.querySelector('#align-left-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('left').run());
  toolbar.querySelector('#align-center-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('center').run());
  toolbar.querySelector('#align-right-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('right').run());
  toolbar.querySelector('#align-justify-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('justify').run());

  // Lists
  toolbar.querySelector('#bullet-list-btn').addEventListener('click', () => editor.chain().focus().toggleBulletList().run());
  toolbar.querySelector('#ordered-list-btn').addEventListener('click', () => editor.chain().focus().toggleOrderedList().run());
  toolbar.querySelector('#task-list-btn').addEventListener('click', () => editor.chain().focus().toggleTaskList().run());

  // Blocks
  toolbar.querySelector('#blockquote-btn').addEventListener('click', () => editor.chain().focus().toggleBlockquote().run());
  toolbar.querySelector('#code-block-btn').addEventListener('click', () => editor.chain().focus().toggleCodeBlock().run());
  toolbar.querySelector('#hr-btn').addEventListener('click', () => editor.chain().focus().setHorizontalRule().run());

  // Link
  toolbar.querySelector('#link-btn').addEventListener('click', () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  });

  // Image
  toolbar.querySelector('#image-btn').addEventListener('click', () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  });

  // Table
  toolbar.querySelector('#table-select').addEventListener('change', (e) => {
    const action = e.target.value;
    switch (action) {
      case 'insert':
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');
        if (rows && cols) {
          editor.chain().focus().insertTable({
            rows: parseInt(rows),
            cols: parseInt(cols),
            withHeaderRow: true
          }).run();
        }
        break;
      case 'addRowBefore':
        editor.chain().focus().addRowBefore().run();
        break;
      case 'addRowAfter':
        editor.chain().focus().addRowAfter().run();
        break;
      case 'deleteRow':
        editor.chain().focus().deleteRow().run();
        break;
      case 'addColumnBefore':
        editor.chain().focus().addColumnBefore().run();
        break;
      case 'addColumnAfter':
        editor.chain().focus().addColumnAfter().run();
        break;
      case 'deleteColumn':
        editor.chain().focus().deleteColumn().run();
        break;
      case 'mergeCells':
        editor.chain().focus().mergeCells().run();
        break;
      case 'splitCell':
        editor.chain().focus().splitCell().run();
        break;
      case 'toggleHeader':
        editor.chain().focus().toggleHeaderRow().run();
        break;
      case 'cellBackground':
        const bgColor = prompt('Cell background color (hex or name):', '#f0f0f0');
        if (bgColor) {
          editor.chain().focus().setCellAttribute('backgroundColor', bgColor).run();
        }
        break;
      case 'cellBorder':
        const borderColor = prompt('Border color (hex):', '#000000');
        const borderWidth = prompt('Border width (px):', '1');
        if (borderColor && borderWidth) {
          editor.chain().focus()
            .setCellAttribute('borderColor', borderColor)
            .setCellAttribute('borderWidth', borderWidth + 'px')
            .setCellAttribute('borderStyle', 'solid')
            .run();
        }
        break;
      case 'deleteTable':
        editor.chain().focus().deleteTable().run();
        break;
    }
    e.target.value = '';
  });

  // Custom blocks
  toolbar.querySelector('#block-select').addEventListener('change', (e) => {
    const block = e.target.value;
    switch (block) {
      case 'info':
        editor.chain().focus().setInfoBox().run();
        break;
      case 'warning':
        editor.chain().focus().setWarningBox().run();
        break;
      case 'success':
        editor.chain().focus().setSuccessBox().run();
        break;
      case 'tip':
        editor.chain().focus().setTipBox().run();
        break;
      case 'biology':
        editor.chain().focus().setBiologyBox().run();
        break;
    }
    e.target.value = '';
  });

  // Undo/Redo
  toolbar.querySelector('#undo-btn').addEventListener('click', () => editor.chain().focus().undo().run());
  toolbar.querySelector('#redo-btn').addEventListener('click', () => editor.chain().focus().redo().run());
}
