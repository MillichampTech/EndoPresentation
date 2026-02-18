
(() => {
  const HTML = document.documentElement;

  // Keys (standalone)
  const THEME_KEY = 'ean_theme_v1';
  const REDUCE_KEY = 'ean_reduce_v1';
  const UNDERLINE_KEY = 'ean_underline_v1';
  const READABLE_KEY = 'ean_readable_v1';
  const FONT_KEY = 'ean_font_v1';

  const THEMES = ['light','dark','contrast','dyslexia'];
  const DEFAULT_THEME = 'light';

  const refs = {
    theme: () => document.getElementById('themeSelect'),
    font: () => document.getElementById('fontSizeRange'),
    fontLabel: () => document.getElementById('fontSizeLabel'),
    reduce: () => document.getElementById('toggleReduceMotion'),
    underline: () => document.getElementById('toggleUnderline'),
    readable: () => document.getElementById('toggleReadable'),
    live: () => document.getElementById('a11y-live'),
  };

  function announce(msg){
    const el = refs.live();
    if (!el) return;
    el.textContent = '';
    // slight delay improves SR announcement reliability
    setTimeout(() => { el.textContent = msg; }, 20);
  }

  function applyUnderline(on){
    document.querySelectorAll('a').forEach(a => {
      if (on) a.classList.add('underline-links');
      else a.classList.remove('underline-links');
    });
  }

  function applyTheme(name, persist=true){
    if (!THEMES.includes(name)) name = DEFAULT_THEME;
    HTML.setAttribute('data-theme', name);
    if (persist) localStorage.setItem(THEME_KEY, name);
    const sel = refs.theme();
    if (sel) sel.value = name;
    announce(`Theme set to ${name}.`);
  }

  function applyFontSize(percent, persist=true){
    const p = Math.max(90, Math.min(150, parseInt(percent,10) || 100));
    const px = 16 * (p/100);
    HTML.style.setProperty('--base-font-size', `${px}px`);
    const lab = refs.fontLabel();
    if (lab) lab.textContent = `${p}%`;
    const r = refs.font();
    if (r) r.value = p;
    if (persist) localStorage.setItem(FONT_KEY, String(p));
    announce(`Text size ${p} percent.`);
  }

  function applyReduce(on, persist=true){
    if (on) HTML.setAttribute('data-reduce-motion','true');
    else HTML.removeAttribute('data-reduce-motion');
    if (persist){
      if (on) localStorage.setItem(REDUCE_KEY,'true');
      else localStorage.removeItem(REDUCE_KEY);
    }
  }

  function applyReadable(on, persist=true){
    if (on) HTML.setAttribute('data-readable-font','true');
    else HTML.removeAttribute('data-readable-font');
    if (persist){
      if (on) localStorage.setItem(READABLE_KEY,'true');
      else localStorage.removeItem(READABLE_KEY);
    }
  }

  function load(){
    const t = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
    applyTheme(t, false);

    const f = localStorage.getItem(FONT_KEY);
    applyFontSize(f ? parseInt(f,10) : 100, false);

    const reduce = localStorage.getItem(REDUCE_KEY) === 'true' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    applyReduce(reduce, false);
    const reduceCb = refs.reduce();
    if (reduceCb) reduceCb.checked = reduce;

    const underline = localStorage.getItem(UNDERLINE_KEY) === 'true';
    applyUnderline(underline);
    const underlineCb = refs.underline();
    if (underlineCb) underlineCb.checked = underline;

    const readable = localStorage.getItem(READABLE_KEY) === 'true';
    applyReadable(readable, false);
    const readableCb = refs.readable();
    if (readableCb) readableCb.checked = readable;
  }

  function bind(){
    refs.theme()?.addEventListener('change', (e) => applyTheme(e.target.value, true));
    refs.font()?.addEventListener('input', (e) => applyFontSize(e.target.value, false));
    refs.font()?.addEventListener('change', (e) => applyFontSize(e.target.value, true));

    refs.reduce()?.addEventListener('change', (e) => {
      applyReduce(!!e.target.checked, true);
      announce(e.target.checked ? 'Reduced motion on.' : 'Reduced motion off.');
    });

    refs.underline()?.addEventListener('change', (e) => {
      const on = !!e.target.checked;
      if (on) localStorage.setItem(UNDERLINE_KEY,'true');
      else localStorage.removeItem(UNDERLINE_KEY);
      applyUnderline(on);
      announce(on ? 'Link underlines on.' : 'Link underlines off.');
    });

    refs.readable()?.addEventListener('change', (e) => {
      applyReadable(!!e.target.checked, true);
      announce(e.target.checked ? 'Readable mode on.' : 'Readable mode off.');
    });

    // Re-apply underline if Translate injects links/DOM
    const mo = new MutationObserver(() => {
      const underline = localStorage.getItem(UNDERLINE_KEY) === 'true';
      if (underline) applyUnderline(true);
    });
    mo.observe(document.body, { childList:true, subtree:true });
  }

  // Google Translate init (classic widget)
  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
  };

  document.addEventListener('DOMContentLoaded', () => { load(); bind(); });
})();
