
(function(){
  const path = (window.location.pathname || '').replace(/\\/g, '/');
  const file = path.split('/').pop() || 'index.html';
  const inMembers = path.includes('/members/');
  const prefix = inMembers ? '../' : '';
  const nav = [
    ['index.html', 'Home'],
    ['motivtrading_about.html', 'About'],
    ['motivtrading_start.html', 'Start Here'],
    ['motivtrading_free_guide.html', 'Free Guide'],
    ['motivtrading_trades.html', 'Trades'],
    ['motivtrading_contact.html', 'Contact'],
    ['members/dashboard.html', 'Dashboard'],
    ['members/tools.html', 'Tools'],
    ['members/journal.html', 'Journal']
  ];
  const isActive = (href) => {
    const target = href.split('/').pop();
    if (href.startsWith('members/') && inMembers) {
      return target === file;
    }
    return target === file;
  };
  const navLinks = nav.map(([href,label]) => `<a href="${prefix}${href}" class="${isActive(href) ? 'active' : ''}">${label}</a>`).join('');
  const dashboardActive = inMembers && file === 'dashboard.html';
  const loginActive = !inMembers && file === 'motivtrading_login.html';
  const header = `
    <header class="site-shell-header">
      <div class="shell-inner">
        <a class="shell-brand" href="${prefix}index.html" aria-label="MotivTrading home">
          <div class="shell-logo">MT</div>
          <div>
            <div class="shell-brand-top">MotivTrading</div>
            <div class="shell-brand-bottom">Trading Academy</div>
          </div>
        </a>
        <nav class="shell-nav" aria-label="Primary navigation">
          ${navLinks}
        </nav>
        <div class="shell-actions">
          <a class="shell-ghost ${loginActive ? 'active' : ''}" href="${prefix}motivtrading_login.html">Login</a>
          <a class="shell-cta ${dashboardActive ? 'active' : ''}" href="${prefix}members/dashboard.html">Members Area</a>
        </div>
      </div>
    </header>`;
  document.body.classList.add('has-shell-header');
  document.body.insertAdjacentHTML('afterbegin', header);
})();
