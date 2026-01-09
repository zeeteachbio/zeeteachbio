export function renderSearchResults(query = '', results = []) {
    const containerStyle = `
    padding: 20px 16px;
    color: white;
  `;

    const headerStyle = `
    margin-bottom: 24px;
  `;

    const backBtnStyle = `
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8b5cf6;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
  `;

    const searchBoxStyle = `
    position: relative;
    margin-bottom: 24px;
  `;

    const inputStyle = `
    width: 100%;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50px;
    padding: 12px 20px;
    color: white;
    font-size: 14px;
    outline: none;
  `;

    const cardStyle = `
    padding: 16px;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    display: block;
    text-decoration: none;
  `;

    return `
    <div class="search-results-view" style="${containerStyle}">
      <div style="${headerStyle}">
        <a href="/" class="mobile-nav-link" style="${backBtnStyle}">
          <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </a>
        <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">Results for "${query}"</h1>
        <p style="color: #94a3b8; font-size: 14px;">Found ${results.length} articles matching your search.</p>
      </div>

      <div style="${searchBoxStyle}">
        <input id="mz-search-input-results" type="text" placeholder="Search again..." value="${query}" style="${inputStyle}" />
        <button data-search-trigger="mz-search-input-results" style="position: absolute; right: 6px; top: 6px; background: #8b5cf6; border: none; border-radius: 50px; color: white; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;">Search</button>
      </div>

      <div class="results-list">
        ${results.length > 0 ? results.map(item => `
          <a href="${item.url}" class="result-card mobile-nav-link" style="${cardStyle}">
            <div style="font-weight: 700; color: white; margin-bottom: 4px; font-size: 16px;">${item.title}</div>
            <div style="font-size: 12px; color: #8b5cf6; margin-bottom: 8px; font-weight: 600;">${item.category || ''} ${item.chapter ? '• ' + item.chapter : ''}</div>
            <div style="font-size: 13px; color: #94a3b8; line-height: 1.4;">${item.excerpt || 'Read more about this topic...'}</div>
          </a>
        `).join('') : `
          <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
            <p>No matches found. Try a different keyword.</p>
          </div>
        `}
      </div>
    </div>
  `;
}
