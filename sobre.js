/* â”€â”€ TIMELINE ACCORDION â”€â”€ */
(function () {
  const toggles = document.querySelectorAll('.timeline-toggle');
  if (!toggles.length) return;

  function currentLang() {
    return localStorage.getItem('garisign-lang') || 'pt';
  }

  function getStoryNum(toggle) {
    // data-story="timeline.1" â†’ "1"
    return (toggle.dataset.story || '').split('.')[1];
  }

  function populatePanel(panel, num) {
    const entry = translations?.[currentLang()]?.timeline?.[num];
    if (!entry?.long) return;
    panel.innerHTML = '';
    entry.long.forEach((text, i) => {
      const p = document.createElement('p');
      p.textContent = text;
      p.style.transitionDelay = `${i * 0.08 + 0.05}s`;
      panel.appendChild(p);
    });
  }

  function setToggleText(toggle, isOpen) {
    const lang = currentLang();
    const key = isOpen ? 'close' : 'open';
    const text = translations?.[lang]?.timeline?.toggle?.[key] ?? (isOpen ? 'Fechar â†‘' : 'Ver HistÃ³ria â†“');
    toggle.textContent = text;
    toggle.dataset.i18n = `timeline.toggle.${key}`;
  }

  function measurePanel(panel) {
    // Disable transition, expand to auto, measure real height, collapse back
    panel.style.transition = 'none';
    panel.style.paddingTop = '22px';
    panel.style.paddingBottom = '22px';
    panel.style.height = 'auto';
    const h = panel.getBoundingClientRect().height;
    panel.style.height = '0';
    panel.style.paddingTop = '0';
    panel.style.paddingBottom = '0';
    // Force browser to commit collapsed state before re-enabling transition
    panel.getBoundingClientRect();
    panel.style.transition = '';
    return h;
  }

  function openPanel(toggle, panel) {
    populatePanel(panel, getStoryNum(toggle));
    const targetH = measurePanel(panel);
    panel.style.paddingTop = '22px';
    panel.style.paddingBottom = '22px';
    panel.style.height = targetH + 'px';
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    setToggleText(toggle, true);
  }

  function closePanel(toggle, panel) {
    panel.style.height = '0';
    panel.style.paddingTop = '0';
    panel.style.paddingBottom = '0';
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    setToggleText(toggle, false);
  }

  toggles.forEach(toggle => {
    const panelId = toggle.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (!panel) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';

      // Accordion: close all other open panels first
      toggles.forEach(t => {
        if (t === toggle) return;
        const pid = t.getAttribute('aria-controls');
        const p = document.getElementById(pid);
        if (p && t.getAttribute('aria-expanded') === 'true') closePanel(t, p);
      });

      if (isOpen) {
        closePanel(toggle, panel);
      } else {
        openPanel(toggle, panel);
      }
    });
  });

  // Re-populate open panels when language changes
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        toggles.forEach(toggle => {
          const panelId = toggle.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (!panel) return;
          const isOpen = toggle.getAttribute('aria-expanded') === 'true';
          setToggleText(toggle, isOpen);
          if (isOpen) {
            populatePanel(panel, getStoryNum(toggle));
            const targetH = measurePanel(panel);
            panel.style.paddingTop = '22px';
            panel.style.paddingBottom = '22px';
            panel.style.height = targetH + 'px';
          }
        });
      }, 0);
    });
  });
})();

/* â”€â”€ TIMELINE ITEMS REVEAL â”€â”€ */
(function () {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach(item => observer.observe(item));
})();
