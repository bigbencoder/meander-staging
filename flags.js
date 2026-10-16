/* Meander feature flags + preview-noindex — hostname-driven, so the SAME code
   behaves correctly on production vs previews with no per-environment file to
   diverge. PROD_HOSTS is the real production domain(s); everything else (the
   benannaink + meanderbeercompany preview hosts, *.github.io, localhost) is a
   non-production preview. */
(function () {
  var PROD_HOSTS = [
    'meanderbrewingco.com',
    'www.meanderbrewingco.com',
    // The pre-launch production host. Kept so the live site never flips to
    // "Coming Soon" + noindex in the minutes between merging the domain change
    // and GitHub serving the new domain; after cutover it only serves redirects.
    'meander.benannaink.com'
    // ^ the hosts above are the ones that show live content and are indexable.
    //   meanderbrewingco.com is the customer-facing domain (launched 2026-10-16).
  ];
  // The TEST site (meander-staging repo). It shows real content so changes can be
  // tested there before they are promoted to production, but it is still
  // noindexed below and blocked by its own robots.txt (Ben, 2026-10-16).
  var TEST_HOSTS = [
    'meanderbeercompany.com',
    'www.meanderbeercompany.com'
  ];
  var isProd = PROD_HOSTS.indexOf(location.hostname) !== -1;
  var isTest = TEST_HOSTS.indexOf(location.hostname) !== -1;
  window.MEANDER_ENV = isProd ? 'prod' : (isTest ? 'test' : 'staging');
  window.MEANDER_FLAGS = {
    // events page shows a "Coming Soon" placeholder on every host that is
    // neither production nor the test site (*.github.io, stray copies, localhost)
    eventsComingSoon: !isProd && !isTest
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
