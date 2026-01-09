import { renderHeader } from './components/Header.js';
import { renderSections, initMobileSections } from './components/Sections.js';
import { renderBottomNav, updateBottomNavActive } from './components/BottomNav.js';
import { renderArticleView } from './components/ArticleView.js';
import { renderSearchSuggestions } from './components/SearchSuggestions.js';
import { renderSearchResults } from './components/SearchResults.js';
import { renderNavigationMenus } from './components/NavigationMenus.js';

let searchIndex = [];
let currentSearchQuery = '';
let appState = {
  activeTab: 'home'
};

export async function renderMobileApp(root) {
  // --- Initialize Search Index ---
  const fetchSearchIndex = async () => {
    try {
      const res = await fetch('/articles.json');
      searchIndex = await res.json();
    } catch (e) {
      console.error('Failed to load search index:', e);
    }
  };
  fetchSearchIndex();

  const getPageContext = () => {
    if (currentSearchQuery) return 'search';
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html' || path === '') return 'home';

    const isArticle = path.endsWith('.html') && !path.endsWith('index.html');
    if (isArticle) return 'article';

    if (path.includes('/stb/')) return 'stb';
    if (path.includes('/akueb/')) return 'akueb';

    return 'article';
  };

  const updateLayout = async () => {
    const context = getPageContext();
    const isSearch = context === 'search';
    const path = window.location.pathname;

    let classId = null;
    const match = path.match(/class(\d+)/);
    if (match) classId = match[1];

    appState.activeTab = (context === 'article' || context === 'home' || context === 'search') ? 'home' : context;

    root.innerHTML = `
      <div id="mobile-app-shell" style="display: flex; flex-direction: column; min-height: 100vh; background: #0f172a; position: relative;">
        ${renderHeader()}
        <main id="mobile-main-content" style="flex: 1; padding-bottom: 80px; overflow-x: hidden;">
          ${isSearch ? renderSearchResults(currentSearchQuery, filterResults(currentSearchQuery)) :
        (context === 'article' ? renderArticleView() : renderSections(context, classId))
      }
        </main>
        <div id="mobile-nav-wrapper">
          ${renderBottomNav(appState.activeTab)}
        </div>
        <!-- Fixed Overlay Menus -->
        ${renderNavigationMenus()}
      </div>
    `;

    if (context !== 'article' && !isSearch) {
      initMobileSections(context, classId);
    }

    updateBottomNavActive(context, classId);
    bindAppEvents(context);

    const desktopApp = document.getElementById('app');
    if (desktopApp) desktopApp.style.display = 'none';

    window.scrollTo(0, 0);
  };

  const filterResults = (q) => {
    const query = q.toLowerCase();
    return searchIndex.filter(item =>
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(query))
    );
  };

  // --- Robust Global Navigation (Overlay/Sheet Approach) ---
  if (!window._mobileNavBound) {
    window._mobileNavBound = true;

    document.addEventListener('click', async (e) => {
      // Only act if mobile root exists and is visible
      const mobileRoot = document.getElementById('mobile-app-root');
      if (!mobileRoot || mobileRoot.style.display === 'none') return;

      const link = e.target.closest('a');
      const closeBtn = e.target.closest('.close-sheet-btn');
      const isOverlay = e.target.classList.contains('sheet-overlay');

      // Handle Close triggers
      if (closeBtn || isOverlay) {
        document.querySelectorAll('.sheet-overlay').forEach(el => el.classList.remove('sheet-open'));
        return;
      }

      if (link && link.href && link.href.startsWith(window.location.origin) && !link.hasAttribute('download') && link.target !== '_blank') {
        const url = new URL(link.href);
        const path = url.pathname;
        const currentPath = window.location.pathname;
        const tab = link.getAttribute('data-tab');

        // --- Board Toggle (Action Sheet) ---
        if (tab === 'stb' || tab === 'akueb') {
          e.preventDefault();
          e.stopPropagation();

          const sheetId = tab === 'stb' ? 'stb-sheet' : 'akueb-sheet';
          const otherSheetId = tab === 'stb' ? 'akueb-sheet' : 'stb-sheet';

          document.getElementById(otherSheetId)?.classList.remove('sheet-open');
          const sheet = document.getElementById(sheetId);
          if (sheet) {
            const nowOpen = sheet.classList.toggle('sheet-open');
            console.log(`[MobileNav] ${tab.toUpperCase()} Sheet: ${nowOpen ? 'OPEN' : 'CLOSED'}`);
          }
          return;
        }

        // Standard SPA Navigation logic...
        if (url.hash && currentPath !== '/' && currentPath !== '/index.html') {
          e.preventDefault();
          window.history.pushState({}, '', '/' + url.hash);
          currentSearchQuery = '';
          document.querySelectorAll('.sheet-overlay').forEach(el => el.classList.remove('sheet-open'));
          updateLayout();
          return;
        }

        if (path.includes('mcqsbuilder') || path.includes('admin')) return;
        if (path === currentPath && !url.hash && !currentSearchQuery) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        currentSearchQuery = '';
        // Close menus on nav
        document.querySelectorAll('.sheet-overlay').forEach(el => el.classList.remove('sheet-open'));

        window.history.pushState({}, '', link.href);

        if (path.endsWith('.html') && !path.endsWith('index.html')) {
          await preloadArticle(link.href);
        }

        updateLayout();
      }
    });
  }

  const bindAppEvents = (context) => {
    // Search Box Inputs
    const searchInputs = root.querySelectorAll('input[id^="mz-search-input"]');
    searchInputs.forEach(input => {
      input.oninput = (e) => {
        const val = e.target.value.trim();
        const container = input.parentElement;
        const oldSugg = container.querySelector('.search-suggestions-container');
        if (oldSugg) oldSugg.remove();

        if (val.length > 0) {
          const suggestions = filterResults(val).slice(0, 6);
          const suggHTML = renderSearchSuggestions(suggestions);
          container.insertAdjacentHTML('beforeend', suggHTML);

          container.querySelectorAll('.suggestion-item').forEach(el => {
            el.onclick = async (ev) => {
              ev.stopPropagation();
              const targetUrl = el.getAttribute('data-url');
              await preloadArticle(targetUrl);
              window.history.pushState({}, '', targetUrl);
              updateLayout();
            };
          });
        }
      };

      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          currentSearchQuery = input.value.trim();
          if (currentSearchQuery) updateLayout();
        }
      };
    });

    // Search Buttons
    root.querySelectorAll('[data-search-trigger]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const inputId = btn.getAttribute('data-search-trigger');
        const input = document.getElementById(inputId);
        currentSearchQuery = input?.value?.trim() || '';
        if (currentSearchQuery) updateLayout();
      };
    });

    // Scroll Effects
    const header = document.getElementById('mobile-header');
    const bottomNav = document.getElementById('mobile-bottom-nav');
    let lastScroll = 0;

    window.onscroll = () => {
      const currentScroll = window.pageYOffset;
      if (header) {
        header.style.background = currentScroll > 50 ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.85)';
        header.style.boxShadow = currentScroll > 50 ? '0 10px 30px -10px rgba(0,0,0,0.5)' : 'none';

        // Only hide/show header, keep bottom nav persistent for stability
        if (currentScroll > 150) {
          header.style.transform = currentScroll > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
        } else {
          header.style.transform = 'translateY(0)';
        }
      }
      lastScroll = currentScroll;
    };
  };

  const preloadArticle = async (url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const desktopApp = document.getElementById('app');
      if (desktopApp) {
        desktopApp.innerHTML = doc.getElementById('app')?.innerHTML || doc.body.innerHTML;
      }
    } catch (e) {
      console.error('Failed to preload article:', e);
    }
  };

  window.onpopstate = () => {
    currentSearchQuery = '';
    updateLayout();
  };

  updateLayout();
}
