export function createTableMenu(editor) {
  const menu = document.createElement('div');
  menu.className = 'table-menu';
  menu.innerHTML = `
    <div class="table-menu-header">Table Options</div>
    <div class="table-menu-grid">
      <button class="table-menu-btn" id="tm-add-row-above">+ Row Above</button>
      <button class="table-menu-btn" id="tm-add-row-below">+ Row Below</button>
      <button class="table-menu-btn" id="tm-add-col-left">+ Col Left</button>
      <button class="table-menu-btn" id="tm-add-col-right">+ Col Right</button>
      <button class="table-menu-btn" id="tm-delete-row">Delete Row</button>
      <button class="table-menu-btn" id="tm-delete-col">Delete Column</button>
      <button class="table-menu-btn" id="tm-merge-cells">Merge Cells</button>
      <button class="table-menu-btn" id="tm-split-cell">Split Cell</button>
      <button class="table-menu-btn" id="tm-toggle-header">Toggle Header</button>
      <button class="table-menu-btn" id="tm-cell-bg">Cell Background</button>
      <button class="table-menu-btn" id="tm-border-color">Border Color</button>
      <button class="table-menu-btn" id="tm-border-style">Border Style</button>
      <button class="table-menu-btn" id="tm-border-thickness">Border Thickness</button>
      <button class="table-menu-btn" id="tm-cell-width">Cell Width</button>
      <button class="table-menu-btn table-menu-danger" id="tm-delete-table">Delete Table</button>
    </div>
  `;

  // Attach listeners
  menu.querySelector('#tm-add-row-above').addEventListener('click', () => editor.chain().focus().addRowBefore().run());
  menu.querySelector('#tm-add-row-below').addEventListener('click', () => editor.chain().focus().addRowAfter().run());
  menu.querySelector('#tm-add-col-left').addEventListener('click', () => editor.chain().focus().addColumnBefore().run());
  menu.querySelector('#tm-add-col-right').addEventListener('click', () => editor.chain().focus().addColumnAfter().run());
  menu.querySelector('#tm-delete-row').addEventListener('click', () => editor.chain().focus().deleteRow().run());
  menu.querySelector('#tm-delete-col').addEventListener('click', () => editor.chain().focus().deleteColumn().run());
  menu.querySelector('#tm-merge-cells').addEventListener('click', () => editor.chain().focus().mergeCells().run());
  menu.querySelector('#tm-split-cell').addEventListener('click', () => editor.chain().focus().splitCell().run());

  menu.querySelector('#tm-toggle-header').addEventListener('click', () => {
    editor.chain().focus().toggleHeaderRow().run();
  });

  menu.querySelector('#tm-cell-bg').addEventListener('click', () => {
    const color = prompt('Cell background color (e.g., #ffeb3b, yellow, rgb(255,235,59)):', '#f0f0f0');
    if (color) {
      const { state } = editor;
      const { tr, selection } = state;
      const cells = [];

      selection.ranges.forEach(range => {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (node.type.name === 'customTableCell' || node.type.name === 'customTableHeader' || node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            cells.push({ node, pos });
          }
        });
      });

      cells.forEach(({ node, pos }) => {
        const currentStyle = node.attrs.style || '';
        const newStyle = currentStyle.replace(/background-color:[^;]+;?/g, '').trim() + (currentStyle ? '; ' : '') + `background-color: ${color}`;
        tr.setNodeMarkup(pos, null, { ...node.attrs, style: newStyle.trim() });
      });

      editor.view.dispatch(tr);
    }
  });

  menu.querySelector('#tm-border-color').addEventListener('click', () => {
    const color = prompt('Border color (e.g., #ff0000, red, rgb(255,0,0)):', '#000000');
    if (color) {
      const { state } = editor;
      const { tr, selection } = state;
      const cells = [];

      selection.ranges.forEach(range => {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (node.type.name === 'customTableCell' || node.type.name === 'customTableHeader' || node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            cells.push({ node, pos });
          }
        });
      });

      cells.forEach(({ node, pos }) => {
        const currentStyle = node.attrs.style || '';
        const newStyle = currentStyle.replace(/border-color:[^;]+;?/g, '').trim() + (currentStyle ? '; ' : '') + `border-color: ${color}`;
        tr.setNodeMarkup(pos, null, { ...node.attrs, style: newStyle.trim() });
      });

      editor.view.dispatch(tr);
    }
  });

  menu.querySelector('#tm-border-style').addEventListener('click', () => {
    const borderStyle = prompt(
      'Border style - Choose one:\n' +
      '  solid (default)\n' +
      '  dashed\n' +
      '  dotted\n' +
      '  double\n' +
      '  groove\n' +
      '  ridge\n' +
      '  inset\n' +
      '  outset\n' +
      '  none',
      'solid'
    );
    if (borderStyle) {
      const { state } = editor;
      const { tr, selection } = state;
      const cells = [];

      selection.ranges.forEach(range => {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (node.type.name === 'customTableCell' || node.type.name === 'customTableHeader' || node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            cells.push({ node, pos });
          }
        });
      });

      cells.forEach(({ node, pos }) => {
        const currentStyle = node.attrs.style || '';
        const newStyle = currentStyle.replace(/border-style:[^;]+;?/g, '').trim() + (currentStyle ? '; ' : '') + `border-style: ${borderStyle}`;
        tr.setNodeMarkup(pos, null, { ...node.attrs, style: newStyle.trim() });
      });

      editor.view.dispatch(tr);
    }
  });

  menu.querySelector('#tm-border-thickness').addEventListener('click', () => {
    const width = prompt('Border thickness in pixels (1-10):', '1');
    if (width) {
      const px = width.endsWith('px') ? width : width + 'px';
      const { state } = editor;
      const { tr, selection } = state;
      const cells = [];

      selection.ranges.forEach(range => {
        state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
          if (node.type.name === 'customTableCell' || node.type.name === 'customTableHeader' || node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            cells.push({ node, pos });
          }
        });
      });

      cells.forEach(({ node, pos }) => {
        const currentStyle = node.attrs.style || '';
        const newStyle = currentStyle.replace(/border-width:[^;]+;?/g, '').trim() + (currentStyle ? '; ' : '') + `border-width: ${px}`;
        tr.setNodeMarkup(pos, null, { ...node.attrs, style: newStyle.trim() });
      });

      editor.view.dispatch(tr);
    }
  });

  menu.querySelector('#tm-cell-width').addEventListener('click', () => {
    const width = prompt('Cell width (px or %):', '100px');
    if (width) {
      editor.chain().focus().setCellAttribute('width', width).run();
    }
  });

  menu.querySelector('#tm-delete-table').addEventListener('click', () => {
    if (confirm('Delete this table?')) {
      editor.chain().focus().deleteTable().run();
    }
  });

  return menu;
}
