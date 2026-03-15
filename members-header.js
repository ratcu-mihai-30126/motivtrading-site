import { supabase } from "./js/supabase-client.js";

(async function(){
  const path = (window.location.pathname || '').replace(/\\/g, '/');
  const file = path.split('/').pop() || 'dashboard.html';
  const nav = [
    ['dashboard.html', 'Dashboard'],
    ['tools.html', 'Tools'],
    ['journal.html', 'Journal'],
    ['playbooks.html', 'Playbooks'],
    ['case_studies.html', 'Case Studies'],
    ['resources.html', 'Resources']
  ];
  const isActive = (href) => href === file;
  const navLinks = nav.map(([href,label]) => `<a href="${href}" class="${isActive(href) ? 'active' : ''}">${label}</a>`).join('');
  const dashboardActive = file === 'dashboard.html';
  const header = `
    <header class="site-shell-header members-shell-header">
      <div class="shell-inner">
        <a class="shell-brand" href="dashboard.html" aria-label="MotivTrading members home">
          <div class="shell-logo">MT</div>
          <div>
            <div class="shell-brand-top">MotivTrading</div>
            <div class="shell-brand-bottom">Members Portal</div>
          </div>
        </a>
        <nav class="shell-nav" aria-label="Members navigation">
          ${navLinks}
        </nav>
        <div class="shell-actions">
          <a class="shell-ghost" href="../account.html">Account</a>
          <a class="shell-ghost" href="../index.html">Main Site</a>
          <a class="shell-cta ${dashboardActive ? 'active' : ''}" href="dashboard.html">Course Home</a>
          <button class="shell-ghost" id="headerLogoutBtn" type="button">Logout</button>
        </div>
      </div>
    </header>`;
  document.body.classList.add('has-shell-header');
  document.body.insertAdjacentHTML('afterbegin', header);

  const logoutBtn = document.getElementById('headerLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await supabase.auth.signOut(); } catch (e) {}
      window.location.href = '../index.html';
    });
  }
})();
