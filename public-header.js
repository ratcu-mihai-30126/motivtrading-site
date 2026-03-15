import { supabase } from "./js/supabase-client.js";

(async function(){
  const path = (window.location.pathname || '').replace(/\\/g, '/');
  const file = path.split('/').pop() || 'index.html';
  const nav = [
    ['index.html', 'Home'],
    ['motivtrading_start.html', 'Start'],
    ['motivtrading_free_guide.html', 'Free Guide'],
    ['motivtrading_trades.html', 'Trades'],
    ['motivtrading_about.html', 'About'],
    ['motivtrading_contact.html', 'Contact']
  ];

  const isActive = (href) => href.split('/').pop() === file;
  const navLinks = nav.map(([href,label]) => `<a href="${href}" class="${isActive(href) ? 'active' : ''}">${label}</a>`).join('');

  let isLoggedIn = false;
  let hasPaidAccess = false;

  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    isLoggedIn = !!user;

    if (user) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("course_access")
        .eq("user_id", user.id)
        .eq("course_slug", "motivtrading")
        .maybeSingle();

      hasPaidAccess = !!enrollment?.course_access;
    }
  } catch (error) {
    isLoggedIn = false;
    hasPaidAccess = false;
  }

  let actions = '';

  if (!isLoggedIn) {
    actions = `
      <a class="shell-ghost ${file === 'motivtrading_login.html' ? 'active' : ''}" href="motivtrading_login.html">Login</a>
      <a class="shell-cta ${file === 'motivtrading_start.html' ? 'active' : ''}" href="motivtrading_start.html#offer">Buy Course</a>
    `;
  } else if (hasPaidAccess) {
    actions = `
      <a class="shell-ghost ${file === 'account.html' ? 'active' : ''}" href="account.html">Account</a>
      <a class="shell-ghost" href="members/dashboard.html">Dashboard</a>
      <button class="shell-cta" id="headerLogoutBtn" type="button">Logout</button>
    `;
  } else {
    actions = `
      <a class="shell-ghost ${file === 'account.html' ? 'active' : ''}" href="account.html">Account</a>
      <a class="shell-cta ${file === 'motivtrading_start.html' ? 'active' : ''}" href="motivtrading_start.html#offer">Buy Course</a>
      <button class="shell-ghost" id="headerLogoutBtn" type="button">Logout</button>
    `;
  }

  const header = `
    <header class="site-shell-header public-shell-header">
      <div class="shell-inner">
        <a class="shell-brand" href="index.html" aria-label="MotivTrading home">
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
          ${actions}
        </div>
      </div>
    </header>`;

  document.body.classList.add('has-shell-header');
  document.body.insertAdjacentHTML('afterbegin', header);

  const logoutBtn = document.getElementById('headerLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await supabase.auth.signOut(); } catch (e) {}
      window.location.href = 'index.html';
    });
  }
})();
