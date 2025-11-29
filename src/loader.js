export function renderArticles(containerId, filterFn, limit = null, mode = 'list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Filter and Sort (Newest first)
    let articles = [...searchIndex].reverse();

    if (filterFn) {
        articles = articles.filter(filterFn);
    }

    if (limit) {
        articles = articles.slice(0, limit);
    }

    if (articles.length === 0) {
        container.innerHTML = '<p>No articles found.</p>';
        return;
    }

    if (mode === 'card') {
        container.innerHTML = articles.map(article => `
            <div class="card note-card">
                <div class="card-icon">📄</div>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-text">${article.excerpt || article.title}</p>
                <a href="${article.url}" class="card-link">Read Notes &rarr;</a>
            </div>
        `).join('');
    } else {
        // List mode (default)
        container.innerHTML = articles.map(article => `
            <a href="${article.url}" class="article-card">
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <div style="font-size: 0.875rem; color: var(--color-primary); margin-bottom: 0.5rem; font-weight: 600;">
                        ${article.category}
                    </div>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <span class="read-more">Read Notes &rarr;</span>
                </div>
            </a>
        `).join('');
    }
}
