(function () {
  'use strict';
  const root = document.documentElement;
  const buttons = { en: document.getElementById('enBtn'), ja: document.getElementById('jaBtn') };
  function requestedLanguage() {
    const query = new URLSearchParams(location.search).get('lang');
    if (query === 'en' || query === 'ja') return query;
    try { if (localStorage.getItem('bba-lang') === 'ja') return 'ja'; } catch (_) {}
    return 'en';
  }
  function setLanguage(language, updateUrl) {
    const lang = language === 'ja' ? 'ja' : 'en';
    root.lang = lang;
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
    if (nav) nav.setAttribute('aria-label', lang === 'ja' ? 'メインナビゲーション' : 'Main navigation');
    try { localStorage.setItem('bba-lang', lang); } catch (_) {}
    if (updateUrl) {
      const current = new URL(location.href);
      current.searchParams.set('lang', lang);
      try { history.replaceState(null, '', current.pathname + current.search + current.hash); } catch (_) {}
    }
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href || /^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;
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
