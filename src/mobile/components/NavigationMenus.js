export function renderNavigationMenus() {
    const overlayStyle = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 5000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: flex-end;
  `;

    const sheetStyle = `
    width: 100%;
    background: #0f172a;
    border-radius: 32px 32px 0 0;
    padding: 24px;
    padding-bottom: calc(32px + env(safe-area-inset-bottom));
    transform: translateY(100%);
    transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  `;

    const menuItemStyle = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    color: white;
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
  `;

    const renderContent = (type) => `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto 16px;"></div>
      <h3 style="font-size: 18px; color: white; margin: 0;">Select ${type.toUpperCase()} Class</h3>
    </div>
    <div style="display: flex; flex-direction: column;">
      <a href="/${type}/class9/" class="menu-action-link" style="${menuItemStyle}">
        <span>Class 9</span>
        <svg style="width: 20px; height: 20px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 5l7 7-7 7" /></svg>
      </a>
      <a href="/${type}/class10/" class="menu-action-link" style="${menuItemStyle}">
        <span>Class 10</span>
        <svg style="width: 20px; height: 20px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 5l7 7-7 7" /></svg>
      </a>
      <a href="/${type}/class11/" class="menu-action-link" style="${menuItemStyle}">
        <span>Class 11</span>
        <svg style="width: 20px; height: 20px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 5l7 7-7 7" /></svg>
      </a>
      <a href="/${type}/class12/" class="menu-action-link" style="${menuItemStyle}">
        <span>Class 12</span>
        <svg style="width: 20px; height: 20px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 5l7 7-7 7" /></svg>
      </a>
    </div>
    <button class="close-sheet-btn" style="width: 100%; padding: 16px; margin-top: 8px; color: #94a3b8; font-weight: 600; font-size: 15px;">Cancel</button>
  `;

    return `
    <style>
      .sheet-overlay.sheet-open {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      .sheet-overlay.sheet-open .sheet-card {
        transform: translateY(0) !important;
      }
      .menu-action-link:active {
        background: rgba(139, 92, 246, 0.1) !important;
        transform: scale(0.98);
      }
    </style>

    <div id="stb-sheet" class="sheet-overlay" style="${overlayStyle}">
      <div class="sheet-card" style="${sheetStyle}">
        ${renderContent('stb')}
      </div>
    </div>

    <div id="akueb-sheet" class="sheet-overlay" style="${overlayStyle}">
      <div class="sheet-card" style="${sheetStyle}">
        ${renderContent('akueb')}
      </div>
    </div>
  `;
}
