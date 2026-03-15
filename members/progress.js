
(function(){
  const MODULES = [
    { index: 1, file: 'module1_foundations.html', short: 'Foundations', title: 'Trading Foundations' },
    { index: 2, file: 'module2_market_structure.html', short: 'Structure', title: 'Market Structure' },
    { index: 3, file: 'module3_entry_systems.html', short: 'Entries', title: 'Entry Systems' },
    { index: 4, file: 'module4_execution.html', short: 'Execution', title: 'Execution' },
    { index: 5, file: 'module5_risk_management.html', short: 'Risk', title: 'Risk Management' },
    { index: 6, file: 'module6_psychology.html', short: 'Psychology', title: 'Psychology' }
  ];
  const STORAGE_KEY = 'motivTradingCompletedModules';

  function getCompleted(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed)
        ? [...new Set(parsed.map(Number).filter(n => n >= 1 && n <= MODULES.length))].sort((a,b)=>a-b)
        : [];
    } catch (e) {
      return [];
    }
  }

  function setCompleted(list){
    const clean = [...new Set(list.map(Number).filter(n => n >= 1 && n <= MODULES.length))].sort((a,b)=>a-b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    return clean;
  }

  function resetModule(idx){
    return setCompleted(getCompleted().filter(n => n !== idx));
  }

  function resetAll(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  const currentPage = (document.body.dataset.memberPage || '').split('/').pop();
  const currentModule = MODULES.find(m => m.file === currentPage);

  function getNextModule(completed){
    return MODULES.find(m => !completed.includes(m.index)) || MODULES[MODULES.length - 1];
  }

  function render(){
    const completed = getCompleted();
    const completedCount = completed.length;
    const totalModules = MODULES.length;
    const progress = Math.round((completedCount / totalModules) * 100);
    const nextModule = getNextModule(completed);
    const isAllComplete = completedCount === totalModules;

    document.querySelectorAll('[data-progress-label],[data-dashboard-progress]').forEach(el => el.textContent = progress + '%');
    document.querySelectorAll('[data-progress-fill]').forEach(el => el.style.width = progress + '%');
    document.querySelectorAll('[data-completed-count]').forEach(el => el.textContent = completedCount);
    document.querySelectorAll('[data-total-modules]').forEach(el => el.textContent = totalModules);
    document.querySelectorAll('[data-next-title]').forEach(el => el.textContent = isAllComplete ? 'Course completed' : ('Module ' + nextModule.index + ' — ' + nextModule.title));

    document.querySelectorAll('[data-next-module-link]').forEach(el => {
      const href = isAllComplete ? MODULES[0].file : nextModule.file;
      if (el.tagName === 'A') el.setAttribute('href', href);
    });

    document.querySelectorAll('[data-start-course]').forEach(el => {
      el.setAttribute('href', isAllComplete ? MODULES[0].file : nextModule.file);
      if (el.dataset.startCourseLabel !== undefined) {
        el.textContent = isAllComplete ? 'Review from Module 1' : ('Continue with Module ' + nextModule.index);
      }
    });

    document.querySelectorAll('[data-module-link]').forEach(link => {
      const idx = Number(link.dataset.moduleLink);
      link.classList.toggle('completed', completed.includes(idx));
    });

    document.querySelectorAll('[data-module-card]').forEach(card => {
      const idx = Number(card.dataset.moduleCard);
      const pill = card.querySelector('.status-pill');
      const anchor = card.querySelector('a');
      card.classList.toggle('is-complete', completed.includes(idx));
      card.classList.toggle('is-current', currentModule && idx === currentModule.index);
      if (pill) {
        if (completed.includes(idx)) pill.textContent = 'Completed';
        else if (!isAllComplete && idx === nextModule.index) pill.textContent = 'Next up';
        else pill.textContent = 'Available';
      }
      if (anchor && completed.includes(idx)) {
        anchor.dataset.completed = 'true';
      }
    });

    document.querySelectorAll('[data-complete-module]').forEach(btn => {
      const idx = Number(btn.dataset.completeModule);
      const done = completed.includes(idx);
      btn.classList.toggle('is-complete', done);
      btn.textContent = done ? 'Completed ✓' : (btn.classList.contains('btn-complete-sidebar') ? ('Complete Module ' + idx) : 'Mark lesson complete');
    });

    document.querySelectorAll('[data-reset-module]').forEach(btn => {
      const idx = Number(btn.dataset.resetModule);
      const done = completed.includes(idx);
      btn.hidden = !done;
      btn.disabled = !done;
    });

    document.querySelectorAll('[data-reset-all-progress]').forEach(btn => {
      btn.hidden = completedCount === 0;
      btn.disabled = completedCount === 0;
    });

    document.querySelectorAll('[data-lesson-status-text]').forEach(el => {
      if (!currentModule) return;
      el.textContent = completed.includes(currentModule.index) ? 'Completed and saved' : 'Not completed yet';
    });

    document.querySelectorAll('[data-lesson-status-subtext]').forEach(el => {
      if (!currentModule) return;
      const label = completed.includes(currentModule.index)
        ? 'This module is counted in your overall progress. You can reset it anytime and run through the lesson again from scratch.'
        : 'Complete this lesson to save it in your progress. You can also reset it anytime and go through the lesson again from scratch.';
      el.textContent = label;
    });

    document.querySelectorAll('[data-course-finished]').forEach(el => {
      el.hidden = !isAllComplete;
    });
  }

  render();

  document.querySelectorAll('[data-complete-module]').forEach(btn => {
    btn.addEventListener('click', function(){
      const idx = Number(btn.dataset.completeModule);
      setCompleted([...getCompleted(), idx]);
      render();
    });
  });

  document.querySelectorAll('[data-reset-module]').forEach(btn => {
    btn.addEventListener('click', function(){
      const idx = Number(btn.dataset.resetModule);
      resetModule(idx);
      render();
    });
  });

  document.querySelectorAll('[data-reset-all-progress]').forEach(btn => {
    btn.addEventListener('click', function(){
      resetAll();
      render();
    });
  });
})();
