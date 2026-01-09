export function renderHeader() {
  const headerStyle = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      transition: transform 0.3s ease, background 0.3s ease;
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      width: 100%;
    `;

  const logoCircleStyle = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

  const searchBarStyle = `
      flex: 1;
      max-width: 180px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 50px;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    `;

  return `
    <header id="mobile-header" style="${headerStyle}">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="${logoCircleStyle}">
          <img src="/logo-hexagon.svg" alt="Zee Teach" style="width: 20px; height: 20px;" />
        </div>
        <span style="font-size: 17px; font-weight: 700; color: white; white-space: nowrap;">Zee Teach</span>
      </div>
      
      <div style="${searchBarStyle}">
        <input id="mz-search-input-header" type="text" placeholder="Search..." style="flex: 1; background: transparent; border: none; outline: none; color: white; font-size: 13px; font-family: inherit;" />
        <button data-search-trigger="mz-search-input-header" style="background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center;">
          <svg style="width: 16px; height: 16px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </header>
  `;
}
