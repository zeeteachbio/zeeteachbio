export function renderBottomNav(activeTab = 'home', options = {}) {
  const { showStbMenu = false, showAkuebMenu = false } = options;

  const navStyle = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 2000; /* Higher priority */
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: env(safe-area-inset-bottom);
      transition: transform 0.3s ease;
      -webkit-tap-highlight-color: transparent;
    `;

  const navContainerStyle = `
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 64px;
      padding: 0 8px;
    `;

  const navItemStyle = (tabName) => `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px;
      text-decoration: none;
      color: ${activeTab === tabName ? '#8b5cf6' : '#64748b'};
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      -webkit-tap-highlight-color: transparent;
      min-width: 64px;
    `;

  // Base style for the menus (hidden by default)
  const menuContainerStyle = `
    position: absolute;
    bottom: 80px;
    left: 16px;
    right: 16px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
    transform-origin: bottom;
    z-index: 3000; /* Max priority */
    
    /* Hidden State */
    opacity: 0;
    transform: scale(0.95) translateY(20px);
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  const menuItemStyle = `
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    color: white;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const classes = [
    { id: 'class9', name: 'Class 9' },
    { id: 'class10', name: 'Class 10' },
    { id: 'class11', name: 'Class 11' },
    { id: 'class12', name: 'Class 12' }
  ];

  const renderMenuContent = (type) => `
    <div style="font-size: 11px; color: #94a3b8; padding: 0 4px 4px 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
      Select ${type.toUpperCase()} Class
    </div>
    ${classes.map(c => `
      <a href="/${type}/${c.id}/" style="${menuItemStyle}">
        <span>${c.name}</span>
        <svg style="width: 16px; height: 16px; color: #8b5cf6;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    `).join('')}
  `;

  return `
    <nav id="mobile-bottom-nav" style="${navStyle}">
      <style>
        .mobile-nav-link:active {
          transform: scale(0.9);
          opacity: 0.8;
        }
        .active-glow::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 25px;
          height: 15px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
          pointer-events: none;
        }
      </style>

      <div style="${navContainerStyle}">
        <a href="#top" class="mobile-nav-link ${activeTab === 'home' ? 'active-glow' : ''}" data-tab="home" style="${navItemStyle('home')}">
          <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span style="font-size: 11px; font-weight: 600;">Home</span>
        </a>
        <a href="#stb-section" class="mobile-nav-link ${activeTab === 'stb' ? 'active-glow' : ''}" data-tab="stb" style="${navItemStyle('stb')}">
          <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span style="font-size: 11px; font-weight: 600;">STB</span>
        </a>
        <a href="#akueb-section" class="mobile-nav-link ${activeTab === 'akueb' ? 'active-glow' : ''}" data-tab="akueb" style="${navItemStyle('akueb')}">
          <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span style="font-size: 11px; font-weight: 600;">AKUEB</span>
        </a>
        <a href="https://mcqsbuilder.vercel.app/" target="_blank" class="mobile-nav-link" data-tab="test" style="${navItemStyle('test')}">
          <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span style="font-size: 11px; font-weight: 600;">Test</span>
        </a>
      </div>
    </nav>
  `;
}

export function updateBottomNavActive(context, classId = null) {
  const nav = document.getElementById('mobile-bottom-nav');
  if (!nav) return;

  const links = nav.querySelectorAll('.mobile-nav-link');
  links.forEach(link => {
    const tab = link.getAttribute('data-tab');
    link.classList.remove('active-glow');

    // Logic to determine if this tab should be active
    const isActive = (tab === 'home' && (context === 'home' || context === 'article' || context === 'search')) ||
      (tab === 'stb' && context === 'stb') ||
      (tab === 'akueb' && context === 'akueb');

    if (isActive) {
      link.classList.add('active-glow');
      link.style.color = '#8b5cf6';
    } else {
      link.style.color = '#64748b';
    }
  });
}
