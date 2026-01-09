import { api } from '../../services/api.js';

// Styles
const sectionStyle = `
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 20px;
`;

const cardStyle = `
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 10px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
`;

const sectionHeaderStyle = `
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const dotStyle = (color) => `
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${color};
  box-shadow: 0 0 12px ${color};
`;

const iconBoxStyle = (color) => `
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${color}20;
  border: 1px solid ${color}30;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
`;

// Render a single article card (for Latest Articles - with title + excerpt)
function renderLatestArticleCard(article) {
  return `
    <a href="${article.url}" style="${cardStyle}">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 600; font-size: 15px; color: white; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${article.title}
        </div>
        <div style="font-size: 12px; color: #94a3b8; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${article.excerpt || ''}
        </div>
      </div>
      <svg style="width: 18px; height: 18px; color: #64748b; flex-shrink: 0; margin-left: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  `;
}

// Render a TOP article card (for Top Articles - with TOP badge + views)
function renderTopArticleCard(article) {
  return `
    <a href="${article.url}" style="${cardStyle} background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.05));">
      <div style="display: flex; align-items: center; flex: 1; min-width: 0;">
        <span style="flex-shrink: 0; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; background: #8b5cf6; color: white; margin-right: 12px;">TOP</span>
        <div style="min-width: 0; flex: 1;">
          <div style="font-weight: 600; font-size: 14px; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${article.title}
          </div>
          <div style="font-size: 12px; color: #94a3b8;">${article.chapter || article.category || ''}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
        <span style="font-size: 11px; color: #64748b;">${article.views || 0} views</span>
        <svg style="width: 18px; height: 18px; color: #64748b;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  `;
}

// Render a class card (for AKUEB/STB sections)
function renderClassCard(c, iconColor = '#8b5cf6') {
  return `
    <a href="${c.href}" style="${cardStyle}">
      <div style="display: flex; align-items: center;">
        <div style="${iconBoxStyle(iconColor)}">
          <svg style="width: 22px; height: 22px; color: ${iconColor};" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <span style="font-weight: 600; font-size: 16px; color: white;">${c.title}</span>
          <div style="font-size: 13px; color: #94a3b8;">${c.sub}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; color: #64748b;">${c.views}</span>
        <svg style="width: 18px; height: 18px; color: #64748b;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  `;
}

// Static fallback data
const akuebCards = [
  { title: 'Class 9', sub: 'Biology Notes', views: '1 view', href: '/akueb/class9/' },
  { title: 'Class 10', sub: 'Exam Prep Materials', views: '2 views', href: '/akueb/class10/' },
  { title: 'Class 11', sub: 'Genetics & Ecology', views: '7 views', href: '/akueb/class11/' },
  { title: 'Class 12', sub: 'Advanced Concepts', views: '0 views', href: '/akueb/class12/' }
];

const stbCards = [
  { title: 'Class 9', sub: 'Biology Notes', views: '1 view', href: '/stb/class9/' },
  { title: 'Class 10', sub: 'Exam Prep Materials', views: '2 views', href: '/stb/class10/' },
  { title: 'Class 11', sub: 'Genetics & Ecology', views: '7 views', href: '/stb/class11/' },
  { title: 'Class 12', sub: 'Advanced Concepts', views: '3 views', href: '/stb/class12/' }
];


function renderHero() {
  return `
    <div id="home-hero" style="padding: 40px 24px; text-align: center; background: radial-gradient(circle at top, rgba(139, 92, 246, 0.1) 0%, transparent 70%);">
        <h1 style="font-size: 32px; font-weight: 800; color: white; margin-bottom: 12px; line-height: 1.1; letter-spacing: -0.02em;">
          Master Biology <span style="color: #8b5cf6;">with Ease</span>
        </h1>
        <p style="font-size: 15px; color: #94a3b8; margin: 0 auto 32px auto; max-width: 320px; line-height: 1.6;">
          Comprehensive study materials for STB and AKUEB students. Everything you need to ace your exams.
        </p>
        
        <div style="position: relative; max-width: 400px; margin: 0 auto;">
          <input id="mz-search-input-hero" type="text" placeholder="What topic are you looking for?" style="width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 50px; padding: 14px 20px; color: white; font-size: 14px; outline: none; backdrop-filter: blur(10px);" />
          <button data-search-trigger="mz-search-input-hero" style="position: absolute; right: 6px; top: 6px; background: #8b5cf6; border: none; border-radius: 50px; color: white; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
            Search
          </button>
        </div>
    </div>
  `;
}

export function renderSections(context = 'home', classId = null) {
  if (context !== 'home' && classId) {
    return renderClassView(context, classId);
  }

  // Home view
  return `
    ${renderHero()}
    <div id="latest-section" class="mobile-section" style="padding: 20px 16px;">
        <div style="${sectionHeaderStyle}">
          <div style="${dotStyle('#8b5cf6')}"></div>
          <h2 style="font-size: 18px; font-weight: 700; color: white;">Latest Articles</h2>
          <a href="#" style="font-size: 13px; color: #8b5cf6; text-decoration: none; font-weight: 500; margin-left: auto;">View All</a>
        </div>
        <div id="mobile-latest-articles" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Shimmer -->
            <div class="glass-card-premium" style="height: 80px; border-radius: 16px;"></div>
            <div class="glass-card-premium" style="height: 80px; border-radius: 16px;"></div>
        </div>
    </div>

    <div id="top-section" class="mobile-section" style="padding: 20px 16px;">
        <div style="${sectionHeaderStyle}">
          <svg style="width: 20px; height: 20px; color: #c4b5fd;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 style="font-size: 18px; font-weight: 700; color: white;">Top Articles</h2>
        </div>
        <div id="mobile-top-articles" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Shimmer -->
            <div class="glass-card-premium" style="height: 80px; border-radius: 16px;"></div>
            <div class="glass-card-premium" style="height: 80px; border-radius: 16px;"></div>
        </div>
    </div>

    <div id="akueb-section" class="mobile-section" style="padding: 24px 16px;">
        <div style="${sectionHeaderStyle}">
          <div style="${dotStyle('#34d399')}"></div>
          <h2 style="font-size: 18px; font-weight: 700; color: white;">AKUEB</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${akuebCards.map(c => renderClassCard(c, '#34d399')).join('')}
        </div>
    </div>

    <div id="stb-section" class="mobile-section" style="padding: 24px 16px;">
        <div style="${sectionHeaderStyle}">
          <div style="${dotStyle('#38bdf8')}"></div>
          <h2 style="font-size: 18px; font-weight: 700; color: white;">Sindh Board</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
            ${stbCards.map(c => renderClassCard(c, '#38bdf8')).join('')}
        </div>
    </div>
  `;
}

function renderClassView(type, classId) {
  const title = `${type.toUpperCase()} Class ${classId.replace('class', '')}`;
  const iconColor = type === 'akueb' ? '#34d399' : '#38bdf8';

  return `
    <div style="padding: 24px 16px;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: ${iconColor}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">${type} Notes</div>
        <h2 style="font-size: 28px; font-weight: 800; color: white;">Class ${classId.replace('class', '')}</h2>
      </div>

      <div id="class-chapters-container" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Chapters loading shimmer -->
        <div class="glass-card-premium" style="height: 100px; border-radius: 16px;"></div>
        <div class="glass-card-premium" style="height: 100px; border-radius: 16px;"></div>
      </div>
    </div>
  `;
}

async function loadClassChapters(type, classId) {
  const container = document.getElementById('class-chapters-container');
  if (!container) return;

  try {
    const articles = await api.getArticles();
    const classNum = classId.replace('class', '');
    const searchTerms = [
      `${type.toUpperCase()} Class ${classNum}`,
      `${type === 'akueb' ? 'AKUEB' : 'STB'} Class ${classNum}`
    ];

    const filtered = articles.filter(a => {
      const cat = a.category.toLowerCase();
      return searchTerms.some(term => cat.includes(term.toLowerCase()));
    });

    // Group by chapter
    const chaptersMap = {};
    filtered.forEach(a => {
      const chName = a.chapter || 'General Articles';
      if (!chaptersMap[chName]) chaptersMap[chName] = [];
      // Deduplicate by URL to prevent ghost entries
      if (!chaptersMap[chName].some(existing => existing.url === a.url)) {
        chaptersMap[chName].push(a);
      }
    });

    // Sort chapters numerically
    const sortedChapterNames = Object.keys(chaptersMap).sort((a, b) => {
      const numA = parseInt(a.match(/^\d+/) || 999);
      const numB = parseInt(b.match(/^\d+/) || 999);
      return numA - numB;
    });

    if (sortedChapterNames.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 40px 0; background: rgba(255,255,255,0.03); border-radius: 20px;">No chapters found for ${type.toUpperCase()} Class ${classNum} yet.</div>`;
      return;
    }

    container.innerHTML = sortedChapterNames.map(chName => {
      // Sort articles within the chapter numerically by their title prefix
      const articles = chaptersMap[chName].sort((a, b) => {
        const numA = a.title.match(/^[\d.]+/);
        const numB = b.title.match(/^[\d.]+/);
        if (numA && numB) {
          return numA[0].localeCompare(numB[0], undefined, { numeric: true, sensitivity: 'base' });
        }
        return a.title.localeCompare(b.title);
      });

      return `
        <div class="glass-card-premium" style="padding: 18px; border-radius: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px;">
             <div style="width: 32px; height: 32px; border-radius: 8px; background: #8b5cf620; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <span style="color: #a78bfa; font-weight: 700; font-size: 14px;">${chName.match(/^\d+/) || '•'}</span>
             </div>
             <h3 style="font-size: 16px; font-weight: 700; color: white; margin: 0; line-height: 1.4;">
               ${chName.replace(/^\d+[\.\s]*/, '')}
             </h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${articles.map(a => `
              <a href="${a.url}" style="display: flex; align-items: center; gap: 12px; text-decoration: none; color: #cbd5e1; font-size: 14px; padding: 10px 8px; border-radius: 10px; transition: background 0.2s;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; box-shadow: 0 0 8px #8b5cf6; flex-shrink: 0;"></div>
                <span style="flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a.title}</span>
                <svg style="width: 14px; height: 14px; color: #475569;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: #ef4444; padding: 20px; text-align: center;">Error loading chapters. Please try again.</div>`;
  }
}

export async function initMobileSections(context = 'home', classId = null) {
  if (context === 'home') {
    try {
      const articles = await api.getArticles();

      // Latest Articles
      const latestArticles = articles.slice(0, 5);
      const latestContainer = document.getElementById('mobile-latest-articles');
      if (latestContainer) {
        latestContainer.innerHTML = latestArticles.length > 0
          ? latestArticles.map(a => renderLatestArticleCard(a)).join('')
          : '<div style="color: #64748b; text-align: center; padding: 16px;">No articles yet</div>';
      }

      // Top Articles
      const topArticles = [...articles]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
      const topContainer = document.getElementById('mobile-top-articles');
      if (topContainer) {
        topContainer.innerHTML = topArticles.length > 0
          ? topArticles.map(a => renderTopArticleCard(a)).join('')
          : '<div style="color: #64748b; text-align: center; padding: 16px;">No articles yet</div>';
      }
    } catch (error) {
      console.error('Failed to load mobile articles:', error);
    }
  } else if (classId) {
    loadClassChapters(context, classId);
  }
}
