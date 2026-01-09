export function renderArticleView(passedContent = null, passedTitle = null) {
  if (passedContent && passedTitle) {
    return generateArticleHTML(passedTitle, passedContent);
  }

  const appElement = document.getElementById('app');
  if (!appElement) return '<div style="color: white; padding: 40px; text-align: center;">Loading content...</div>';

  // Try multiple selectors for flexibility
  const contentElement = appElement.querySelector('#article-content') ||
    appElement.querySelector('.article-body') ||
    appElement.querySelector('main article');

  if (!contentElement) {
    return `
            <div style="color: white; padding: 40px; text-align: center;">
                <h2 style="font-size: 18px; margin-bottom: 12px;">Article content not found</h2>
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">This article might still be loading or has a different structure.</p>
                <a href="/" class="mobile-nav-link" style="color: #8b5cf6; font-weight: 600;">Back to Home</a>
            </div>
        `;
  }

  const titleElement = appElement.querySelector('h1') || appElement.querySelector('.article-title');
  const title = titleElement ? titleElement.textContent : 'Biology Article';

  return generateArticleHTML(title, contentElement.innerHTML);
}

function generateArticleHTML(title, contentHTML) {
  return `
    <div class="mobile-article-view" style="padding: 24px 16px; color: #cbd5e1; line-height: 1.6;">
      <a href="javascript:history.back()" class="mobile-back-link" style="display: inline-flex; align-items: center; gap: 6px; color: #94a3b8; text-decoration: none; margin-bottom: 24px; font-size: 14px; font-weight: 600; -webkit-tap-highlight-color: transparent;">
        <svg style="width: 18px; height: 18px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </a>

      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 26px; font-weight: 800; color: white; margin-bottom: 12px; line-height: 1.2;">${title}</h1>
        <div style="height: 3px; width: 40px; background: #8b5cf6; border-radius: 2px;"></div>
      </div>
      
      <div class="article-body-mobile" style="font-size: 16px; color: #cbd5e1;">
        ${contentHTML}
      </div>

      <div style="margin-top: 40px; padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; background: rgba(30,41,59,0.3); border-radius: 20px;">
        <p style="margin-bottom: 16px; color: #94a3b8; font-size: 14px;">End of article. Hope you learned something today!</p>
        <a href="javascript:history.back()" class="mobile-nav-link" style="display: inline-flex; align-items: center; gap: 8px; color: white; background: #8b5cf6; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); -webkit-tap-highlight-color: transparent;">
          Explore More Topics
        </a>
      </div>
    </div>
    
    <style>
      .article-body-mobile h2 { color: white; font-size: 20px; margin-top: 32px; margin-bottom: 16px; font-weight: 700; }
      .article-body-mobile h3 { color: white; font-size: 18px; margin-top: 24px; margin-bottom: 12px; font-weight: 600; }
      .article-body-mobile p { margin-bottom: 20px; }
      .article-body-mobile ul, .article-body-mobile ol { padding-left: 20px; margin-bottom: 20px; }
      .article-body-mobile li { margin-bottom: 12px; }
      .article-body-mobile strong { color: white; font-weight: 700; }
      .article-body-mobile img { max-width: 100%; height: auto; border-radius: 16px; margin: 24px 0; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
      
      /* Table Styles */
      .article-body-mobile table { width: 100% !important; border-collapse: separate !important; border-spacing: 0 !important; margin: 24px 0 !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; overflow: hidden !important; background: rgba(255,255,255,0.02) !important; }
      .article-body-mobile th { background: rgba(139, 92, 246, 0.2) !important; color: white !important; font-weight: 700 !important; text-align: left !important; padding: 12px !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; border-right: 1px solid rgba(255,255,255,0.1) !important; }
      .article-body-mobile td { padding: 12px !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; border-right: 1px solid rgba(255,255,255,0.05) !important; font-size: 14px !important; vertical-align: top !important; }
      .article-body-mobile tr:last-child td { border-bottom: none !important; }
      .article-body-mobile th:last-child, .article-body-mobile td:last-child { border-right: none !important; }

      /* Hide elements that shouldn't be in mobile view */
      .article-body-mobile .back-btn, 
      .article-body-mobile header, 
      .article-body-mobile footer, 
      .article-body-mobile .nav,
      .article-body-mobile .logo { display: none !important; }
    </style>
  `;
}
