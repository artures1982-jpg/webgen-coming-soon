// test/shared/clerk.js — wspoldzielona inicjalizacja Clerk JS SDK (vanilla, bez frameworka).
// Laduje sie przez <script src="/shared/clerk.js"> na kazdej stronie ktora potrzebuje auth
// (login, dashboard, generator, cennik, index, regulamin, polityka-prywatnosci, admin).
(function () {
  var PUBLISHABLE_KEY = 'pk_live_Y2xlcmsud2ViZ2VuLnBsJA';
  var FRONTEND_API = 'clerk.webgen.pl';

  var clerkReadyPromise = null;

  function loadClerkScript() {
    return new Promise(function (resolve, reject) {
      if (window.Clerk) return resolve();
      var script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-clerk-publishable-key', PUBLISHABLE_KEY);
      script.src = 'https://' + FRONTEND_API + '/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
      script.addEventListener('load', resolve);
      script.addEventListener('error', function () {
        reject(new Error('Nie udalo sie zaladowac Clerk SDK'));
      });
      document.head.appendChild(script);
    });
  }

  // Zwraca Promise<Clerk> — gotowy do uzycia obiekt window.Clerk po Clerk.load().
  window.getClerk = function () {
    if (!clerkReadyPromise) {
      clerkReadyPromise = loadClerkScript().then(function () {
        return window.Clerk.load();
      }).then(function () {
        return window.Clerk;
      });
    }
    return clerkReadyPromise;
  };

  // Montuje przycisk uzytkownika (avatar/menu z wylogowaniem) w danym elemencie,
  // albo link "Zaloguj sie" jesli user nie jest zalogowany. Zastepuje 7 kopii wgNavAuth().
  window.mountNavAuth = function (el) {
    if (!el) return;
    window.getClerk().then(function (Clerk) {
      if (Clerk.user) {
        Clerk.mountUserButton(el);
      } else {
        el.innerHTML = '<a href="/login/" class="nav-login-link">Zaloguj się</a>';
      }
    }).catch(function (err) {
      console.error('mountNavAuth error:', err);
    });
  };
})();
