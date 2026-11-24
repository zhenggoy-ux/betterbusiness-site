(function () {
  'use strict';
  const root = document.documentElement;
  const buttons = { en: document.getElementById('enBtn'), ja: document.getElementById('jaBtn'), zh: document.getElementById('zhBtn') };
  function requestedLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (Object.hasOwn(buttons, query)) return query;
    try {
      const saved = localStorage.getItem('bba-lang');
      if (Object.hasOwn(buttons, saved)) return saved;
    } catch (_) {}
    return 'en';
  }
  function setLanguage(language, updateUrl) {
    const lang = language;
    root.lang = lang === 'zh' ? 'zh-CN' : lang;
    root.classList.toggle('lang-zh', lang === 'zh');
    root.classList.toggle('lang-ja', lang === 'ja');
    root.classList.toggle('lang-en', lang === 'en');
    root.classList.remove('bba-preinit', 'bba-nav-initializing');
    document.querySelectorAll('[data-en][data-ja]').forEach(function (element) {
      element.textContent = element.getAttribute('data-' + lang);
    });
    Object.keys(buttons).forEach(function (key) {
      if (!buttons[key]) return;
      buttons[key].classList.toggle('on', key === lang);
      buttons[key].setAttribute('aria-pressed', String(key === lang));
    });
    const nav = document.querySelector('header nav');
    if (nav) nav.setAttribute('aria-label', { en: 'Main navigation', ja: 'メインナビゲーション', zh: '主导航' }[lang]);
    document.querySelector('.langs').setAttribute('aria-label', { en: 'Language', ja: '言語', zh: '语言' }[lang]);
    try { localStorage.setItem('bba-lang', lang); } catch (_) {}
    if (updateUrl) {
      const current = new URL(location.href);
      current.searchParams.set('lang', lang);
      try { history.replaceState(null, '', current.pathname + current.search + current.hash); } catch (_) {}
    }
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;
      const target = new URL(href, location.href);
      if (target.origin !== location.origin || !/\.html$/.test(target.pathname)) return;
      target.searchParams.set('lang', lang);
      const filename = target.pathname.substring(target.pathname.lastIndexOf('/') + 1);
      link.setAttribute('href', filename + target.search + target.hash);
    });
  }
  Object.keys(buttons).forEach(function (lang) {
    if (buttons[lang]) buttons[lang].addEventListener('click', function () { setLanguage(lang, true); });
  });
  window.addEventListener('popstate', function () { setLanguage(requestedLanguage(), false); });
  setLanguage(requestedLanguage(), true);
})();
