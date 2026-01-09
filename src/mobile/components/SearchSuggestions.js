export function renderSearchSuggestions(suggestions = []) {
    if (suggestions.length === 0) return '';

    const dropdownStyle = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 2000;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  `;

    const itemStyle = `
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
  `;

    return `
    <div class="search-suggestions-container" style="${dropdownStyle}">
      ${suggestions.map(item => `
        <div class="suggestion-item" data-url="${item.url}" style="${itemStyle}">
          <div style="font-weight: 600; color: white; font-size: 14px;">${item.title}</div>
          <div style="font-size: 12px; color: #94a3b8;">${item.category || 'Article'}</div>
        </div>
      `).join('')}
    </div>
  `;
}
