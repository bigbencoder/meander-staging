/* Meander feature flags + preview-noindex — hostname-driven, so the SAME code
   behaves correctly on production vs previews with no per-environment file to
   diverge. PROD_HOSTS is the real production domain(s); everything else (the
   benannaink + meanderbeercompany preview hosts, *.github.io, localhost) is a
   non-production preview. */
(function () {
  var PROD_HOSTS = [
    'meanderbrewingco.com',
    'www.meanderbrewingco.com'
    // ^ the real customer-facing domain (launching later). It's the only host
    //   that should show live content and be indexable.
  ];
  var isProd = PROD_HOSTS.indexOf(location.hostname) !== -1;
  window.MEANDER_ENV = isProd ? 'prod' : 'staging';
  window.MEANDER_FLAGS = {
    // events page shows a "Coming Soon" placeholder on every non-production host
    eventsComingSoon: !isProd
  };

  // SEO: keep every non-production host OUT of search results until the real
  // site launches, so the previews never get indexed as duplicate content.
  // Google renders this and honors the injected tag; static utility pages
  // (tv/qr/sanity) also carry their own hard-coded noindex.
  if (!isProd) {
    var m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex, nofollow';
    (document.head || document.documentElement).appendChild(m);
  }
})();
