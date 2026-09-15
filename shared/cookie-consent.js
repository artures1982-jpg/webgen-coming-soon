// shared/cookie-consent.js — samodzielny baner zgody na pliki cookie (widoczny, dziala,
// wstrzykuje wlasny CSS+HTML do strony). Laduje sie przez <script src="/shared/cookie-consent.js">
// na kazdej stronie, ktora ma Google Analytics — musi byc WCZYTANY PRZED tagiem gtag.js,
// bo to ten skrypt decyduje, czy gtag.js w ogole zostanie dolozony do <head>.
//
// Historia: ten widget istnial juz jako w pelni dzialajacy prototyp w cookie-consent.html
// (samodzielna strona demo, nigdy nie podlinkowana do zadnej realnej strony) — polityka
// prywatnosci od dawna obiecywala "Google Analytics 4 wylacznie po zgodzie", ale zaden baner
// nigdy nie trafil na produkcje. Zlapane 2026-09-15 przy wdrazaniu gtag.js: dodanie GA
// BEZWARUNKOWO pogorszyloby ten rozjazd (GA zaczalby realnie zbierac dane bez pytania o zgode).
// Ten plik to ten sam prototyp, wyciagniety do wspoldzielonego zasobu (usunieta strona demo
// i panel "STAN ZGOD (DEMO)"), z prawdziwym Measurement ID zamiast placeholdera.
(function () {
  'use strict';

  var GA_MEASUREMENT_ID = 'G-N2TJE2MCE2';
  var STORAGE_KEY = 'wg_cookie_consent';
  var CONSENT_VERSION = '1.0';

  var CSS = ''
    + '#wg-cookie-overlay{display:none;position:fixed;inset:0;background:rgba(5,7,12,.85);z-index:9998;backdrop-filter:blur(4px)}'
    + '#wg-cookie-overlay.active{display:block}'
    + '#wg-cookie-banner{display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0F1420;border-top:1px solid rgba(0,229,160,.25);box-shadow:0 -8px 40px rgba(0,0,0,.6);padding:0;animation:wgSlideUp .35s cubic-bezier(.16,1,.3,1);font-family:"Poppins",sans-serif}'
    + '#wg-cookie-banner.active{display:block}'
    + '@keyframes wgSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}'
    + '.wg-banner-inner{max-width:1200px;margin:0 auto;padding:20px 28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap}'
    + '#wg-cookie-banner::before{content:"";display:block;height:3px;background:linear-gradient(90deg,#00E5A0,#0066FF,#7B4FFF)}'
    + '.wg-banner-icon{font-size:28px;flex-shrink:0}'
    + '.wg-banner-text{flex:1;min-width:280px}'
    + '.wg-banner-text h3{font-size:15px;font-weight:700;color:#F3F6FC;margin-bottom:4px}'
    + '.wg-banner-text p{font-size:13px;color:#8E97AC;line-height:1.5;margin:0}'
    + '.wg-banner-text a{color:#00E5A0;text-decoration:none}'
    + '.wg-banner-text a:hover{text-decoration:underline}'
    + '.wg-banner-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center;flex-shrink:0}'
    + '.wg-btn{padding:10px 20px;border-radius:8px;font-family:"Poppins",sans-serif;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s;white-space:nowrap}'
    + '.wg-btn-accept{background:#00E5A0;color:#fff}'
    + '.wg-btn-accept:hover{background:#00B386;transform:translateY(-1px)}'
    + '.wg-btn-reject{background:transparent;color:#8E97AC;border:1px solid rgba(255,255,255,.16)}'
    + '.wg-btn-reject:hover{color:#F3F6FC;border-color:rgba(255,255,255,.3)}'
    + '.wg-btn-settings{background:transparent;color:#00E5A0;border:1px solid rgba(76,111,255,.3)}'
    + '.wg-btn-settings:hover{background:rgba(76,111,255,.08)}'
    + '#wg-cookie-modal{display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;padding:20px;font-family:"Poppins",sans-serif}'
    + '#wg-cookie-modal.active{display:flex}'
    + '.wg-modal-box{background:#0F1420;border:1px solid rgba(255,255,255,.12);border-radius:16px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.8);animation:wgPopIn .3s cubic-bezier(.16,1,.3,1)}'
    + '@keyframes wgPopIn{from{transform:scale(.94) translateY(10px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}'
    + '.wg-modal-header{padding:24px 24px 20px;border-bottom:1px solid rgba(255,255,255,.08);position:relative}'
    + '.wg-modal-header::before{content:"";display:block;height:3px;background:linear-gradient(90deg,#00E5A0,#0066FF,#7B4FFF);border-radius:16px 16px 0 0;position:absolute;top:-1px;left:-1px;right:-1px}'
    + '.wg-modal-header h2{font-size:18px;font-weight:700;color:#F3F6FC;margin-bottom:6px}'
    + '.wg-modal-header p{font-size:13px;color:#8E97AC;line-height:1.6;margin:0}'
    + '.wg-modal-header p a{color:#00E5A0;text-decoration:none}'
    + '.wg-modal-close{position:absolute;top:20px;right:20px;background:rgba(255,255,255,.07);border:none;color:#8E97AC;width:32px;height:32px;border-radius:8px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}'
    + '.wg-modal-close:hover{background:rgba(255,255,255,.14);color:#F3F6FC}'
    + '.wg-modal-body{padding:20px 24px}'
    + '.wg-cookie-category{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px;transition:border-color .2s}'
    + '.wg-cookie-category:hover{border-color:rgba(255,255,255,.16)}'
    + '.wg-cat-header{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer}'
    + '.wg-cat-info{flex:1}'
    + '.wg-cat-title{font-size:14px;font-weight:700;color:#F3F6FC;display:flex;align-items:center;gap:8px;margin-bottom:3px}'
    + '.wg-cat-badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;letter-spacing:.04em}'
    + '.wg-badge-required{background:rgba(0,229,160,.12);color:#00E5A0;border:1px solid rgba(76,111,255,.3)}'
    + '.wg-badge-optional{background:rgba(255,255,255,.07);color:#8E97AC;border:1px solid rgba(255,255,255,.12)}'
    + '.wg-cat-desc{font-size:12px;color:#8E97AC;line-height:1.5;margin:0}'
    + '.wg-toggle{position:relative;width:46px;height:26px;flex-shrink:0}'
    + '.wg-toggle input{opacity:0;width:0;height:0;position:absolute}'
    + '.wg-toggle-slider{position:absolute;inset:0;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.16);border-radius:13px;cursor:pointer;transition:all .25s}'
    + '.wg-toggle-slider::before{content:"";position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#8E97AC;border-radius:50%;transition:all .25s}'
    + '.wg-toggle input:checked+.wg-toggle-slider{background:rgba(76,111,255,.2);border-color:rgba(76,111,255,.5)}'
    + '.wg-toggle input:checked+.wg-toggle-slider::before{transform:translateX(20px);background:#00E5A0}'
    + '.wg-toggle input:disabled+.wg-toggle-slider{opacity:.5;cursor:not-allowed}'
    + '.wg-toggle input:disabled:checked+.wg-toggle-slider{background:rgba(76,111,255,.15);border-color:rgba(76,111,255,.3)}'
    + '.wg-cat-details{display:none;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}'
    + '.wg-cat-details.expanded{display:block}'
    + '.wg-cookie-table{width:100%;border-collapse:collapse;font-size:11px}'
    + '.wg-cookie-table th{text-align:left;color:#8E97AC;font-weight:600;padding:4px 8px;letter-spacing:.05em;text-transform:uppercase;font-size:10px}'
    + '.wg-cookie-table td{padding:6px 8px;color:#8E97AC;border-top:1px solid rgba(255,255,255,.05)}'
    + '.wg-cookie-table td:first-child{font-family:monospace;color:#00E5A0;font-size:11px}'
    + '.wg-expand-btn{background:none;border:none;color:#8E97AC;font-family:"Poppins",sans-serif;font-size:11px;cursor:pointer;padding:6px 0 0;display:flex;align-items:center;gap:4px;transition:color .2s}'
    + '.wg-expand-btn:hover{color:#00E5A0}'
    + '.wg-expand-icon{transition:transform .2s}'
    + '.wg-expand-btn.open .wg-expand-icon{transform:rotate(180deg)}'
    + '.wg-modal-footer{padding:16px 24px 24px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:10px;flex-wrap:wrap}'
    + '.wg-btn-save{background:#00E5A0;color:#fff;flex:1}'
    + '.wg-btn-save:hover{background:#00B386}'
    + '.wg-btn-accept-all{background:transparent;color:#00E5A0;border:1px solid rgba(76,111,255,.3);flex:1}'
    + '.wg-btn-accept-all:hover{background:rgba(76,111,255,.08)}'
    + '.wg-btn-reject-all{background:transparent;color:#8E97AC;border:1px solid rgba(255,255,255,.14);width:100%}'
    + '.wg-btn-reject-all:hover{color:#F3F6FC;border-color:rgba(255,255,255,.25)}'
    + '#wg-cookie-settings-btn{display:none;position:fixed;bottom:20px;left:20px;z-index:9990;background:#0F1420;border:1px solid rgba(0,229,160,.25);color:#8E97AC;padding:8px 14px;border-radius:8px;font-family:"Poppins",sans-serif;font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;gap:6px;align-items:center}'
    + '#wg-cookie-settings-btn.visible{display:flex}'
    + '#wg-cookie-settings-btn:hover{background:rgba(255,255,255,.08);color:#00E5A0;border-color:rgba(76,111,255,.4)}'
    + '@media (max-width:600px){.wg-banner-inner{padding:16px;gap:14px}.wg-banner-actions{width:100%}.wg-btn{flex:1;text-align:center}.wg-modal-box{border-radius:12px 12px 0 0;max-height:85vh}#wg-cookie-modal{align-items:flex-end;padding:0}}';

  var HTML = ''
    + '<div id="wg-cookie-banner" role="dialog" aria-label="Ustawienia plików cookie" aria-live="polite">'
    + '<div class="wg-banner-inner">'
    + '<div class="wg-banner-icon" aria-hidden="true">🍪</div>'
    + '<div class="wg-banner-text">'
    + '<h3>Szanujemy Twoją prywatność</h3>'
    + '<p>Używamy plików cookie, aby poprawić jakość Twoich odwiedzin. Część z nich jest niezbędna, inne pomagają nam zrozumieć, jak korzystasz z Serwisu. Więcej informacji znajdziesz w <a href="/polityka-prywatnosci/" target="_blank">Polityce Prywatności</a>.</p>'
    + '</div>'
    + '<div class="wg-banner-actions">'
    + '<button class="wg-btn wg-btn-settings" onclick="WgCookies.showSettings()" aria-label="Dostosuj ustawienia cookie">Dostosuj</button>'
    + '<button class="wg-btn wg-btn-reject" onclick="WgCookies.rejectAll()" aria-label="Odrzuć opcjonalne pliki cookie">Tylko niezbędne</button>'
    + '<button class="wg-btn wg-btn-accept" onclick="WgCookies.acceptAll()" aria-label="Zaakceptuj wszystkie pliki cookie">Akceptuję wszystkie</button>'
    + '</div></div></div>'
    + '<div id="wg-cookie-overlay"></div>'
    + '<div id="wg-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="wg-modal-title"><div class="wg-modal-box">'
    + '<div class="wg-modal-header"><h2 id="wg-modal-title">Ustawienia plików cookie</h2>'
    + '<p>Poniżej możesz wybrać, które kategorie plików cookie akceptujesz. Zawsze możesz zmienić swoje preferencje. Szczegóły w <a href="/polityka-prywatnosci/" target="_blank">Polityce Prywatności</a>.</p>'
    + '<button class="wg-modal-close" onclick="WgCookies.closeSettings()" aria-label="Zamknij">✕</button></div>'
    + '<div class="wg-modal-body">'
    + '<div class="wg-cookie-category"><div class="wg-cat-header"><div class="wg-cat-info">'
    + '<div class="wg-cat-title">Niezbędne<span class="wg-cat-badge wg-badge-required">ZAWSZE WŁĄCZONE</span></div>'
    + '<p class="wg-cat-desc">Konieczne do prawidłowego działania Serwisu. Bez nich strona nie może funkcjonować poprawnie.</p></div>'
    + '<label class="wg-toggle"><input type="checkbox" id="cookie-necessary" checked disabled><span class="wg-toggle-slider"></span></label>'
    + '</div></div>'
    + '<div class="wg-cookie-category"><div class="wg-cat-header"><div class="wg-cat-info">'
    + '<div class="wg-cat-title">Analityczne<span class="wg-cat-badge wg-badge-optional">OPCJONALNE</span></div>'
    + '<p class="wg-cat-desc">Pomagają nam rozumieć, jak użytkownicy korzystają z Serwisu (Google Analytics 4). Dane są anonimizowane i nie służą do śledzenia osobistego.</p></div>'
    + '<label class="wg-toggle"><input type="checkbox" id="cookie-analytics"><span class="wg-toggle-slider"></span></label>'
    + '</div></div>'
    + '<div class="wg-cookie-category"><div class="wg-cat-header"><div class="wg-cat-info">'
    + '<div class="wg-cat-title">Marketingowe<span class="wg-cat-badge wg-badge-optional">OPCJONALNE</span></div>'
    + '<p class="wg-cat-desc">Umożliwiają personalizację reklam (Meta Pixel / Facebook). Ta funkcja jest jeszcze w przygotowaniu — zaznaczenie zgody nic dziś nie włącza.</p></div>'
    + '<label class="wg-toggle"><input type="checkbox" id="cookie-marketing"><span class="wg-toggle-slider"></span></label>'
    + '</div></div>'
    + '</div>'
    + '<div class="wg-modal-footer">'
    + '<button class="wg-btn wg-btn-accept-all" onclick="WgCookies.acceptAll()">Akceptuję wszystkie</button>'
    + '<button class="wg-btn wg-btn-save" onclick="WgCookies.saveSettings()">Zapisz moje ustawienia</button>'
    + '<button class="wg-btn wg-btn-reject-all" onclick="WgCookies.rejectAll()">Tylko niezbędne</button>'
    + '</div></div></div>'
    + '<button id="wg-cookie-settings-btn" onclick="WgCookies.showSettings()" aria-label="Zmień ustawienia cookie">🍪 Ustawienia cookie</button>';

  function injectStyle() {
    var style = document.createElement('style');
    style.setAttribute('data-wg-cookie-consent', '');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function injectHtml() {
    var container = document.createElement('div');
    container.innerHTML = HTML;
    while (container.firstChild) document.body.appendChild(container.firstChild);
  }

  function loadGoogleAnalytics() {
    if (window._wgGaLoaded) return;
    window._wgGaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    window.gtag = gtag;
  }

  function removeAnalyticsCookies() {
    ['_ga', '_gid'].forEach(function (name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + location.hostname;
    });
  }

  var WgCookies = {
    getConsent: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        var data = JSON.parse(raw);
        if (data.version !== CONSENT_VERSION) return null;
        return data;
      } catch (e) { return null; }
    },

    saveConsent: function (analytics, marketing) {
      var data = {
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        necessary: true,
        analytics: !!analytics,
        marketing: !!marketing,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this._applyConsent(data);
      return data;
    },

    _applyConsent: function (consent) {
      if (consent.analytics) loadGoogleAnalytics();
      else removeAnalyticsCookies();
      // Meta Pixel jeszcze nie jest wdrozony w kodzie — nic tu do wlaczenia,
      // patrz cookie-consent.html (historyczny prototyp) dla gotowego wzorca
      // integracji, kiedy Artur zdecyduje sie go faktycznie dodac.
    },

    init: function () {
      injectStyle();
      injectHtml();
      var consent = this.getConsent();
      if (consent) {
        this._applyConsent(consent);
        this._showSettingsBtn();
      } else {
        var self = this;
        setTimeout(function () { self.showBanner(); }, 400);
      }

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') WgCookies.closeSettings();
      });
      var overlay = document.getElementById('wg-cookie-overlay');
      if (overlay) overlay.addEventListener('click', function () { WgCookies.closeSettings(); });
    },

    showBanner: function () {
      var el = document.getElementById('wg-cookie-banner');
      if (el) el.classList.add('active');
    },

    hideBanner: function () {
      var el = document.getElementById('wg-cookie-banner');
      if (el) el.classList.remove('active');
    },

    showSettings: function () {
      document.getElementById('wg-cookie-overlay').classList.add('active');
      document.getElementById('wg-cookie-modal').classList.add('active');
      var consent = this.getConsent();
      if (consent) {
        document.getElementById('cookie-analytics').checked = consent.analytics;
        document.getElementById('cookie-marketing').checked = consent.marketing;
      }
    },

    closeSettings: function () {
      document.getElementById('wg-cookie-overlay').classList.remove('active');
      document.getElementById('wg-cookie-modal').classList.remove('active');
    },

    acceptAll: function () {
      document.getElementById('cookie-analytics').checked = true;
      document.getElementById('cookie-marketing').checked = true;
      this.saveConsent(true, true);
      this.hideBanner();
      this.closeSettings();
      this._showSettingsBtn();
    },

    rejectAll: function () {
      document.getElementById('cookie-analytics').checked = false;
      document.getElementById('cookie-marketing').checked = false;
      this.saveConsent(false, false);
      this.hideBanner();
      this.closeSettings();
      this._showSettingsBtn();
    },

    saveSettings: function () {
      var analytics = document.getElementById('cookie-analytics').checked;
      var marketing = document.getElementById('cookie-marketing').checked;
      this.saveConsent(analytics, marketing);
      this.hideBanner();
      this.closeSettings();
      this._showSettingsBtn();
    },

    _showSettingsBtn: function () {
      var el = document.getElementById('wg-cookie-settings-btn');
      if (el) el.classList.add('visible');
    },
  };

  window.WgCookies = WgCookies;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { WgCookies.init(); });
  } else {
    WgCookies.init();
  }
})();
