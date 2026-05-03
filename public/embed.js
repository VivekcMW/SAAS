/**
 * moonmart.ai Embed Widget Loader
 * https://moonmart.ai/embed.js
 *
 * Usage (vendor pastes one line on their pricing/product page):
 *
 *   <script src="https://moonmart.ai/embed.js" data-app="YOUR_APP_SLUG" async></script>
 *
 * Optional attributes:
 *   data-theme="dark"      (default: "light")
 *   data-width="400"       (default: "340")
 *   data-lang="fr"         (default: browser language / "en")
 *
 * The script finds its own <script> tag via document.currentScript (or the
 * last <script> with src containing "moonmart.ai/embed.js"), creates an
 * <iframe> in its place, and sizes itself to content via postMessage.
 *
 * THIS FILE IS COMPILED TO public/embed.js DURING BUILD.
 * Keep this file plain ES5-compatible so it works without transpilation
 * when served directly from /public/.
 */
(function () {
  'use strict';

  var BASE = 'https://moonmart.ai';

  // ── Locate the loader script tag ─────────────────────────────────────────
  var scriptEl = document.currentScript;
  if (!scriptEl) {
    // Fallback: find by src in case browser doesn't support currentScript
    var scripts = document.querySelectorAll('script[src*="moonmart.ai/embed.js"]');
    scriptEl = scripts[scripts.length - 1] || null;
  }
  if (!scriptEl) { return; }

  var appSlug = scriptEl.getAttribute('data-app') || '';
  var theme   = scriptEl.getAttribute('data-theme') || 'light';
  var width   = parseInt(scriptEl.getAttribute('data-width') || '340', 10);
  var lang    = scriptEl.getAttribute('data-lang')
                || (navigator.language || 'en').split('-')[0];

  if (!appSlug) {
    console.warn('[moonmart] data-app attribute is required on the embed script tag.');
    return;
  }

  // ── Build iframe URL ──────────────────────────────────────────────────────
  var src = BASE + '/embed/app/' + encodeURIComponent(appSlug)
          + '?theme=' + encodeURIComponent(theme)
          + '&lang='  + encodeURIComponent(lang)
          + '&ref='   + encodeURIComponent(window.location.hostname);

  // ── Create the iframe ─────────────────────────────────────────────────────
  var iframe = document.createElement('iframe');
  iframe.src           = src;
  iframe.width         = String(width);
  iframe.height        = '220';   // initial height — resized via postMessage
  iframe.frameBorder   = '0';
  iframe.scrolling     = 'no';
  iframe.title         = 'Moonmart review widget';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('referrerpolicy', 'origin');
  iframe.style.cssText = [
    'border:none',
    'overflow:hidden',
    'display:block',
    'max-width:100%',
    'width:' + width + 'px',
    'height:220px',
    'border-radius:12px',
    'box-shadow:0 2px 12px rgba(0,0,0,0.08)'
  ].join(';');

  // ── Resize to content via postMessage from inside the iframe ─────────────
  window.addEventListener('message', function (evt) {
    if (evt.origin !== BASE) { return; }
    try {
      var msg = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
      if (msg && msg.type === 'mm-embed-resize' && msg.slug === appSlug) {
        iframe.height = String(msg.height);
        iframe.style.height = msg.height + 'px';
      }
    } catch (_) {}
  });

  // ── Replace the script tag with the iframe ────────────────────────────────
  scriptEl.parentNode.replaceChild(iframe, scriptEl);
})();
