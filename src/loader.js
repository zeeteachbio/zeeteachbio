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
            <div class="article-card" style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border);">
                <h3 style="margin-bottom: 0.5rem;">
                    <a href="${article.url}" style="text-decoration: none; color: var(--color-text);">${article.title}</a>
                </h3>
                <div style="font-size: 0.875rem; color: var(--color-primary); margin-bottom: 0.5rem; font-weight: 600;">
                    ${article.category}
                </div>
                <p style="color: var(--color-text-light); margin-bottom: 0.5rem;">${article.excerpt}</p>
                <a href="${article.url}" class="read-more" style="color: var(--color-primary); font-weight: 500; text-decoration: none;">Read Notes &rarr;</a>
            </div>
        `).join('');
    }
}
