// Chooses one of the five designs from ?design=1..5 and keeps it on this site's own links. No cookies, no storage.
(function () {
  var p = new URLSearchParams(location.search), d = p.get('design');
  if (!/^[1-5]$/.test(d || '')) d = '1';
  document.documentElement.setAttribute('data-design', d);
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.designs a').forEach(function (a) {
      var n = a.getAttribute('data-design'); a.setAttribute('aria-current', n === d ? 'true' : 'false');
    });
    if (d === '1') return;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^[a-z][a-z0-9+.-]*:/i.test(h) || h.indexOf('//') === 0 || a.closest('.designs')) return;
      if (/\.(txt|zip|json|jpg)(\?|#|$)/i.test(h)) return;
      var u = new URL(h, location.href); u.searchParams.set('design', d); a.setAttribute('href', u.pathname + u.search + u.hash);
    });
  });
})();
