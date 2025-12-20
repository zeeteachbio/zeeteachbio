export function createToolbar(editor) {
  const toolbar = document.createElement('div');
  toolbar.className = 'tiptap-toolbar';

  // Define groups of controls
  toolbar.innerHTML = `
    <!-- Text Style Group -->
    <div class="toolbar-group">
      <select class="toolbar-select" id="heading-select" style="width: 110px;">
        <option value="">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
    </div>

    <!-- Font Group -->
    <div class="toolbar-group">
      <button class="toolbar-btn" id="bold-btn" title="Bold (Ctrl+B)">
        <i data-feather="bold" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="italic-btn" title="Italic (Ctrl+I)">
        <i data-feather="italic" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="underline-btn" title="Underline (Ctrl+U)">
        <i data-feather="underline" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="strike-btn" title="Strike">
        <i data-feather="type" style="width: 16px; height: 16px;"></i> <!-- Using generic type icon for strike as strict strike isn't standard feather -->
      </button>
      <input type="color" class="toolbar-color" id="text-color" title="Text Color" value="#e2e8f0" style="margin-left: 4px;">
    </div>

    <!-- Alignment Group -->
    <div class="toolbar-group">
      <button class="toolbar-btn" id="align-left-btn" title="Align Left">
        <i data-feather="align-left" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="align-center-btn" title="Align Center">
        <i data-feather="align-center" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="align-right-btn" title="Align Right">
        <i data-feather="align-right" style="width: 16px; height: 16px;"></i>
      </button>
    </div>

    <!-- List Group -->
    <div class="toolbar-group">
      <button class="toolbar-btn" id="bullet-list-btn" title="Bullet List">
        <i data-feather="list" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="ordered-list-btn" title="Numbered List">
        <i data-feather="list" style="width: 16px; height: 16px;"></i> <!-- Feather doesn't distinguish visual bullet/number well, implementation differs -->
      </button>
      <button class="toolbar-btn" id="task-list-btn" title="Task List">
        <i data-feather="check-square" style="width: 16px; height: 16px;"></i>
      </button>
    </div>

    <!-- Insert Group -->
    <div class="toolbar-group">
      <button class="toolbar-btn" id="blockquote-btn" title="Quote">
        <i data-feather="message-square" style="width: 16px; height: 16px;"></i>
      </button>
       <button class="toolbar-btn" id="code-block-btn" title="Code Block">
        <i data-feather="code" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="link-btn" title="Add Link">
        <i data-feather="link" style="width: 16px; height: 16px;"></i>
     </button>
      <button class="toolbar-btn" id="image-btn" title="Add Image">
        <i data-feather="image" style="width: 16px; height: 16px;"></i>
      </button>
    </div>

    <!-- Advanced Group -->
    <div class="toolbar-group">
      <select class="toolbar-select" id="table-select" style="width: 100px;">
        <option value="">Table...</option>
        <option value="insert">Insert</option>
        <option value="deleteTable">Delete</option>
        <option value="addRowAfter">Add Row</option>
        <option value="addColumnAfter">Add Col</option>
        <option value="mergeCells">Merge</option>
        <option value="splitCell">Split</option>
      </select>
       <select class="toolbar-select" id="block-select" style="width: 100px; margin-left: 4px;">
        <option value="">Blocks...</option>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="success">Success</option>
        <option value="biology">Biology</option>
      </select>
    </div>
    
    <!-- History Group -->
    <div class="toolbar-group" style="margin-left: auto; border: none;">
      <button class="toolbar-btn" id="undo-btn" title="Undo">
        <i data-feather="rotate-ccw" style="width: 16px; height: 16px;"></i>
      </button>
      <button class="toolbar-btn" id="redo-btn" title="Redo">
        <i data-feather="rotate-cw" style="width: 16px; height: 16px;"></i>
      </button>
    </div>
  `;

  // Attach event listeners
  attachToolbarListeners(toolbar, editor);

  return toolbar;
}

function attachToolbarListeners(toolbar, editor) {
  // Heading select
  const headingSelect = toolbar.querySelector('#heading-select');
  if (headingSelect) {
    headingSelect.addEventListener('change', (e) => {
      const level = e.target.value;
      if (level) {
        editor.chain().focus().setHeading({ level: parseInt(level) }).run();
      } else {
        editor.chain().focus().setParagraph().run();
      }
      e.target.value = '';
    });
  }

  // Text formatting
  if (toolbar.querySelector('#bold-btn')) toolbar.querySelector('#bold-btn').addEventListener('click', () => editor.chain().focus().toggleBold().run());
  if (toolbar.querySelector('#italic-btn')) toolbar.querySelector('#italic-btn').addEventListener('click', () => editor.chain().focus().toggleItalic().run());
  if (toolbar.querySelector('#underline-btn')) toolbar.querySelector('#underline-btn').addEventListener('click', () => editor.chain().focus().toggleUnderline().run());
  if (toolbar.querySelector('#strike-btn')) toolbar.querySelector('#strike-btn').addEventListener('click', () => editor.chain().focus().toggleStrike().run());

  // Removed Subscript/Superscript/InlineCode from HTML, so removing listeners or checking for them
  if (toolbar.querySelector('#subscript-btn')) toolbar.querySelector('#subscript-btn').addEventListener('click', () => editor.chain().focus().toggleSubscript().run());
  if (toolbar.querySelector('#superscript-btn')) toolbar.querySelector('#superscript-btn').addEventListener('click', () => editor.chain().focus().toggleSuperscript().run());
  if (toolbar.querySelector('#code-btn')) toolbar.querySelector('#code-btn').addEventListener('click', () => editor.chain().focus().toggleCode().run());

  // Colors
  const textColor = toolbar.querySelector('#text-color');
  if (textColor) {
    textColor.addEventListener('input', (e) => {
      editor.chain().focus().setColor(e.target.value).run();
    });
  }

  // Alignment
  if (toolbar.querySelector('#align-left-btn')) toolbar.querySelector('#align-left-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('left').run());
  if (toolbar.querySelector('#align-center-btn')) toolbar.querySelector('#align-center-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('center').run());
  if (toolbar.querySelector('#align-right-btn')) toolbar.querySelector('#align-right-btn').addEventListener('click', () => editor.chain().focus().setTextAlign('right').run());

  // Lists
  if (toolbar.querySelector('#bullet-list-btn')) toolbar.querySelector('#bullet-list-btn').addEventListener('click', () => editor.chain().focus().toggleBulletList().run());
  if (toolbar.querySelector('#ordered-list-btn')) toolbar.querySelector('#ordered-list-btn').addEventListener('click', () => editor.chain().focus().toggleOrderedList().run());
  if (toolbar.querySelector('#task-list-btn')) toolbar.querySelector('#task-list-btn').addEventListener('click', () => editor.chain().focus().toggleTaskList().run());

  // Blocks
  if (toolbar.querySelector('#blockquote-btn')) toolbar.querySelector('#blockquote-btn').addEventListener('click', () => editor.chain().focus().toggleBlockquote().run());
  if (toolbar.querySelector('#code-block-btn')) toolbar.querySelector('#code-block-btn').addEventListener('click', () => editor.chain().focus().toggleCodeBlock().run());

  // Link
  if (toolbar.querySelector('#link-btn')) {
    toolbar.querySelector('#link-btn').addEventListener('click', () => {
      const url = prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    });
  }

  // Image
  if (toolbar.querySelector('#image-btn')) {
    toolbar.querySelector('#image-btn').addEventListener('click', () => {
      const url = prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    });
  }

  // Table
  const tableSelect = toolbar.querySelector('#table-select');
  if (tableSelect) {
    tableSelect.addEventListener('change', (e) => {
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
        case 'addRowAfter':
          editor.chain().focus().addRowAfter().run();
          break;
        case 'addColumnAfter':
          editor.chain().focus().addColumnAfter().run();
          break;
        case 'deleteTable':
          editor.chain().focus().deleteTable().run();
          break;
        case 'mergeCells':
          editor.chain().focus().mergeCells().run();
          break;
        case 'splitCell':
          editor.chain().focus().splitCell().run();
          break;
      }
      e.target.value = '';
    });
  }

  // Custom blocks
  const blockSelect = toolbar.querySelector('#block-select');
  if (blockSelect) {
    blockSelect.addEventListener('change', (e) => {
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
        case 'biology':
          editor.chain().focus().setBiologyBox().run();
          break;
      }
      e.target.value = '';
    });
  }

  // Undo/Redo
  if (toolbar.querySelector('#undo-btn')) toolbar.querySelector('#undo-btn').addEventListener('click', () => editor.chain().focus().undo().run());
  if (toolbar.querySelector('#redo-btn')) toolbar.querySelector('#redo-btn').addEventListener('click', () => editor.chain().focus().redo().run());
}
