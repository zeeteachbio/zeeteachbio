import './style.css';
import { CommentSystem } from './comments.js';
import { api } from './services/api.js';

const initApp = async () => {
    console.log("Initializing App...");

    // --- Mobile Menu & Header Logic ---
    const header = document.querySelector('.header');
    const headerContent = document.querySelector('.header-content');
    const nav = document.querySelector('.nav');

    // --- Dark Mode Logic ---
    const initDarkMode = () => {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        toggleBtn.style.background = 'none';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '1.2rem';
        toggleBtn.style.padding = '0.5rem';
        toggleBtn.style.marginLeft = '0.5rem';
        toggleBtn.style.color = 'var(--color-text)';

        // Check preference
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            document.body.classList.add('dark-mode');
            toggleBtn.innerHTML = '☀️'; // Sun icon for dark mode
        } else {
            toggleBtn.innerHTML = '🌙'; // Moon icon for light mode
        }

        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            toggleBtn.innerHTML = isDark ? '☀️' : '🌙';
        });

        // Insert into header
        if (headerContent) {
            const searchContainer = headerContent.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.after(toggleBtn);
            } else {
                headerContent.appendChild(toggleBtn);
            }
        }
    };
    initDarkMode();

    if (headerContent && nav) {
        // Inject Hamburger Menu if not present
        if (!headerContent.querySelector('.menu-toggle')) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '☰'; // Hamburger icon
            menuToggle.setAttribute('aria-label', 'Toggle navigation');

            // Insert after logo (which is usually first child)
            const logo = headerContent.querySelector('.logo');
            if (logo) {
                logo.after(menuToggle);
            } else {
                headerContent.prepend(menuToggle);
            }

            // Toggle Menu
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                menuToggle.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.innerHTML = '☰';
                }
            });
        }
    }

    // --- Smart Scroll Logic ---
    let lastScrollTop = 0;
    const scrollThreshold = 100; // Minimum scroll to trigger hide

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // Scroll Down
            if (header) header.classList.add('hide');
            if (nav) nav.classList.remove('active'); // Close menu on scroll down
            if (headerContent && headerContent.querySelector('.menu-toggle')) {
                headerContent.querySelector('.menu-toggle').innerHTML = '☰';
            }
        } else {
            // Scroll Up
            if (header) header.classList.remove('hide');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }, { passive: true });


    // --- Fetch Data ---
    let articles = [];
    try {
        articles = await api.getArticles();
    } catch (error) {
        console.error("Failed to fetch articles:", error);
        const errDiv = document.createElement('div');
        errDiv.textContent = "Error: " + error.message;
        errDiv.style.color = 'red';
        document.body.prepend(errDiv);
    }

    // --- View Increment Logic ---
    const currentPath = window.location.pathname;
    if (currentPath.includes('.html') && currentPath !== '/index.html' && currentPath !== '/search.html') {
        // It's an article or class page
        // We need to match the URL in searchData.
        // searchData urls start with /, so currentPath should match.
        await api.incrementViews(currentPath);
    }

    // --- Recent Articles Rendering (Main) ---
    const articleList = document.querySelector('.article-list');
    if (articleList) {
        // Clear existing static content
        articleList.innerHTML = '';

        // Render Latest Articles (already sorted by date in api.getArticles)
        const latestArticles = articles.slice(0, 5);

        articleList.innerHTML = latestArticles.map(article => {
            // Use article.thumbnail if available, else default placeholder
            const bgStyle = article.thumbnail
                ? `background-image: url('${article.thumbnail}'); background-size: cover; background-position: center;`
                : '';

            return `
            <article class="article-card">
                <div class="article-image" style="${bgStyle}"></div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <a href="${article.url}" class="read-more">Read More</a>
                </div>
            </article>
        `}).join('');
    }

    // --- Top Articles Rendering (Sidebar) ---
    const topArticlesList = document.getElementById('top-articles-list');
    if (topArticlesList) {
        // Render Top Articles (sorted by engagement)
        const topArticles = [...articles].sort((a, b) => {
            const engagementA = (a.views || 0) + (a.comments || 0);
            const engagementB = (b.views || 0) + (b.comments || 0);
            return engagementB - engagementA;
        }).slice(0, 5);

        topArticlesList.innerHTML = topArticles.map(article => `
            <li class="recent-item">
                <span class="badge-new">TOP</span>
                <a href="${article.url}">${article.title}</a>
                <span style="font-size: 0.7rem; color: #666; margin-left: auto;">${(article.views || 0) + (article.comments || 0)} views</span>
            </li>
        `).join('');
    }

    // --- Dynamic Class Page Rendering ---
    const classArticlesContainer = document.getElementById('class-articles-container');
    if (classArticlesContainer) {
        // Determine class from URL or Title
        let currentClass = null;
        if (window.location.pathname.includes('class9')) currentClass = 'Class 9';
        else if (window.location.pathname.includes('class10')) currentClass = 'Class 10';
        else if (window.location.pathname.includes('class11')) currentClass = 'Class 11';
        else if (window.location.pathname.includes('class12')) currentClass = 'Class 12';

        if (currentClass) {
            const classArticles = articles.filter(article => article.category === currentClass);

            if (classArticles.length > 0) {
                classArticlesContainer.innerHTML = classArticles.map(article => `
                    <div class="card note-card">
                        <div class="card-body">
                            <h3 class="card-title">${article.title}</h3>
                            <p class="card-text">${article.excerpt}</p>
                            <a href="${article.url}" class="read-more">Read Notes &rarr;</a>
                        </div>
                    </div>
                `).join('');
            } else {
                classArticlesContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center;">No articles found for ${currentClass} yet.</p>`;
            }
        }
    }


    // --- Search Functionality ---

    // 1. Handle Search Inputs (Header & Native)
    const handleSearch = (input) => {
        const query = input.value.trim();
        if (query) {
            window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
        }
    };

    // Search Suggestions Logic
    const setupSearchSuggestions = (input, container) => {
        // Create suggestions container if it doesn't exist
        let suggestionsBox = container.querySelector('.search-suggestions');
        if (!suggestionsBox) {
            suggestionsBox = document.createElement('div');
            suggestionsBox.className = 'search-suggestions';
            container.appendChild(suggestionsBox);
        }

        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            if (query.length < 2) {
                suggestionsBox.style.display = 'none';
                return;
            }

            const matches = articles.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.excerpt.toLowerCase().includes(query)
            ).slice(0, 5);

            if (matches.length > 0) {
                suggestionsBox.innerHTML = matches.map(item => `
                    <div class="suggestion-item" onclick="window.location.href='${item.url}'">
                        <div class="suggestion-title">${item.title}</div>
                        <div class="suggestion-category">${item.category}</div>
                    </div>
                `).join('');
                suggestionsBox.style.display = 'block';
            } else {
                suggestionsBox.style.display = 'none';
            }
        });

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    };

    // Header Search (in the header element)
    const headerSearchInput = document.querySelector('.header .search-input');
    const headerSearchBtn = document.querySelector('.header .search-btn');
    const headerSearchContainer = document.querySelector('.header .search-container');

    // Hero Search (Homepage)
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchBtn = document.getElementById('hero-search-btn');
    const heroSearchContainer = document.querySelector('.hero-search');

    const setupSearch = (input, btn, container) => {
        if (!input || !btn) return;

        setupSearchSuggestions(input, container || input.parentElement);

        btn.onclick = (e) => {
            // Check if on mobile (input hidden or container not active) - Only for header search
            const isMobile = window.innerWidth <= 768;
            if (container && container.classList.contains('search-container') && !container.classList.contains('hero-search') && isMobile && !container.classList.contains('active')) {
                e.preventDefault();
                container.classList.add('active');
                input.focus();
            } else {
                handleSearch(input);
            }
        };

        input.onkeypress = (e) => {
            if (e.key === 'Enter') handleSearch(input);
        };
    };

    setupSearch(headerSearchInput, headerSearchBtn, headerSearchContainer);
    setupSearch(heroSearchInput, heroSearchBtn, heroSearchContainer);

    // Close search on click outside (mobile header search)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            headerSearchContainer &&
            headerSearchContainer.classList.contains('active') &&
            !headerSearchContainer.contains(e.target)) {
            headerSearchContainer.classList.remove('active');
        }
    });

    // Native Class Search (Page Filter)
    const classSearchInput = document.querySelector('.class-search-input');
    const classSearchBtn = document.querySelector('.class-search-btn');

    if (classSearchInput) {
        const filterPageContent = () => {
            const query = classSearchInput.value.trim().toLowerCase();

            // Filter Cards
            const cards = document.querySelectorAll('.card.note-card');
            cards.forEach(card => {
                const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
                const text = card.querySelector('.card-text')?.textContent.toLowerCase() || '';

                if (title.includes(query) || text.includes(query)) {
                    card.style.display = ''; // Reset to default
                } else {
                    card.style.display = 'none';
                }
            });

            // Filter Table Rows (for Class/Chapter lists)
            const tableRows = document.querySelectorAll('.chapter-table tbody tr');
            tableRows.forEach(row => {
                // Check all cells, or specifically the second one (Topic Name)
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };

        classSearchInput.oninput = filterPageContent;

        if (classSearchBtn) {
            classSearchBtn.onclick = (e) => {
                e.preventDefault();
                filterPageContent();
            };
        }

        // Prevent Enter from submitting/redirecting
        classSearchInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filterPageContent();
            }
        };
    }

    // --- Dropdown Logic (Fix for flickering/unstable behavior) ---
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (toggle) {
            // Use onclick to replace potential old listeners
            toggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });

                dropdown.classList.toggle('active');
            };
        }

        // Close when clicking an item inside
        if (menu) {
            menu.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    // Don't close if it's a submenu toggle
                    if (item.classList.contains('submenu-toggle')) return;
                    dropdown.classList.remove('active');
                });
            });
        }
    });

    // Submenu Toggle Logic
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const submenu = toggle.closest('.dropdown-submenu');

            // Close other submenus in the same parent dropdown
            const parentMenu = submenu.closest('.dropdown-menu');
            if (parentMenu) {
                parentMenu.querySelectorAll('.dropdown-submenu.active').forEach(activeSub => {
                    if (activeSub !== submenu) activeSub.classList.remove('active');
                });
            }

            if (submenu) {
                submenu.classList.toggle('active');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });

    // 2. Handle Search Results Page
    if (window.location.pathname.includes('search.html')) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        const grid = document.getElementById('search-results-grid');
        const noResults = document.getElementById('no-results-msg');
        const sectionTitle = document.querySelector('.section-title');

        if (query && grid) {
            // Update title if it exists
            if (sectionTitle) {
                sectionTitle.textContent = `Search Results for "${query}"`;
            }

            const results = articles.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                item.category.toLowerCase().includes(query.toLowerCase())
            );

            if (results.length > 0) {
                grid.innerHTML = results.map(item => `
                    <div class="card article-card" style="flex-direction: column;">
                        <div class="article-content">
                            <span style="font-size: 0.8rem; color: var(--color-primary); font-weight: 600; text-transform: uppercase;">${item.category}</span>
                            <h3 class="article-title" style="font-size: 1.25rem; margin-top: 0.5rem;">${item.title}</h3>
                            <p class="article-excerpt">${item.excerpt}</p>
                            <a href="${item.url}" class="read-more">Read More</a>
                        </div>
                    </div>
                `).join('');
                if (noResults) noResults.style.display = 'none';
            } else {
                grid.innerHTML = '';
                if (noResults) noResults.style.display = 'block';
            }
        } else if (!query && sectionTitle) {
            sectionTitle.textContent = 'Search Results';
            if (grid) grid.innerHTML = '<p style="text-align: center; color: #64748b;">Please enter a search term</p>';
        }
    }

    // 3. Handle Chapter Page
    if (window.location.pathname.includes('chapter.html')) {
        const params = new URLSearchParams(window.location.search);
        const className = params.get('class');
        const chapterName = params.get('chapter');
        const titleEl = document.getElementById('chapter-title');
        const grid = document.getElementById('chapter-articles-grid');
        const searchInput = document.getElementById('chapter-search-input');

        if (className && chapterName && titleEl && grid) {
            titleEl.textContent = `${chapterName} (${className})`;
            document.title = `${chapterName} - ${className} - Zee Teach`;

            // Filter articles by class and chapter
            // Note: api.getArticles returns newest first. User wants oldest first.
            const chapterArticles = articles.filter(article =>
                article.category === className && article.chapter === chapterName
            ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort oldest to newest

            const renderArticles = (list) => {
                if (list.length > 0) {
                    grid.innerHTML = list.map(article => `
                        <div class="card note-card">
                            <div class="card-body">
                                <h3 class="card-title">${article.title}</h3>
                                <p class="card-text">${article.excerpt}</p>
                                <a href="${article.url}" class="read-more">Read Notes &rarr;</a>
                            </div>
                        </div>
                    `).join('');
                } else {
                    grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b;">No articles found for this chapter yet.</p>`;
                }
            };

            renderArticles(chapterArticles);

            // Chapter Search Logic
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.trim().toLowerCase();
                    const filtered = chapterArticles.filter(article =>
                        article.title.toLowerCase().includes(query) ||
                        article.excerpt.toLowerCase().includes(query)
                    );
                    renderArticles(filtered);
                });
            }
        } else if (titleEl) {
            titleEl.textContent = "Chapter Not Found";
            grid.innerHTML = `<p style="text-align: center;">Invalid parameters.</p>`;
        }
    }


    // --- Comment System Injection ---
    // Inject on any page with an article body
    const articleBody = document.querySelector('.article-body');
    if (articleBody || window.location.pathname.includes('article-')) {
        console.log("Injecting comment system...");
        const article = document.querySelector('article') || document.querySelector('main') || document.body;

        // Check if already injected
        if (!document.getElementById('comments-section')) {
            // Create a container for the comments
            const commentSection = document.createElement('section');
            commentSection.id = 'comments-section';
            commentSection.className = 'section';

            const container = document.createElement('div');
            container.className = 'container';
            container.style.maxWidth = '800px';

            commentSection.appendChild(container);

            // Append to the article or main element
            // If article tag exists, append after it. If not, append to main.
            const articleTag = document.querySelector('article');
            if (articleTag) {
                articleTag.after(commentSection);
            } else if (document.querySelector('main')) {
                document.querySelector('main').appendChild(commentSection);
            } else {
                document.body.appendChild(commentSection);
            }

            // Initialize the comment system
            new CommentSystem('comments-section');
        }
    }
};

// Robust initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
