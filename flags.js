/* Meander feature flags — hostname-driven so the SAME code behaves correctly
   on production vs staging with no per-environment file divergence.
   PROD_HOSTS is the allowlist of real production domains; anything else
   (the GoDaddy staging domain, *.github.io, localhost) is treated as staging. */
(function () {
  var PROD_HOSTS = [
    'meander.benannaink.com'
    // add the brewery's real GoDaddy production domain(s) here when they go live
  ];
  var isProd = PROD_HOSTS.indexOf(location.hostname) !== -1;
  window.MEANDER_ENV = isProd ? 'prod' : 'staging';
  window.MEANDER_FLAGS = {
    // events page shows a "Coming Soon" placeholder everywhere EXCEPT production
    eventsComingSoon: !isProd
  };
})();
