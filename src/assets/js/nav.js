/* VeriCorp — Centralised Navigation */
(function () {
  var INVOICE_RAPIDAPI = 'https://rapidapi.com/vericorptestcollab/api/vericorp-invoice-data-extract';
  var COMPANY_RAPIDAPI = 'https://rapidapi.com/vericorptestcollab/api/vericorp';
  var CHECKER_URL = 'https://vericorp-checker.pages.dev';

  var path = window.location.pathname.replace(/\/+$/, '') || '/';

  // Determine page context
  var ctx = 'neutral';
  if (path === '/products/invoice-extract' || path === '/playground' || path.indexOf('/vs/') === 0) ctx = 'invoice';
  if (path === '/products/company-verify' || path === '/products/doc-validate') ctx = 'company';

  // Active page detection
  var isHome = path === '/' || path === '';
  var isPricing = path === '/pricing';
  var isPlayground = path === '/playground';
  var isProductPage = path.indexOf('/products/') === 0;
  var activeProduct = '';
  if (path === '/products/company-verify') activeProduct = 'company-verify';
  if (path === '/products/invoice-extract') activeProduct = 'invoice-extract';
  if (path === '/products/doc-validate') activeProduct = 'doc-validate';

  // Build contextual links
  var pricingHref = '/pricing';
  if (ctx === 'invoice') pricingHref = '/pricing?product=invoice';
  if (ctx === 'company') pricingHref = '/pricing?product=company';

  var playgroundHref = ctx === 'company' ? CHECKER_URL : '/playground';
  var playgroundLabel = ctx === 'company' ? 'Live Demo' : 'Playground';
  var playgroundTarget = ctx === 'company' ? ' target="_blank"' : '';

  var ctaHref = '/pricing';
  if (ctx === 'invoice') ctaHref = INVOICE_RAPIDAPI;
  if (ctx === 'company') ctaHref = COMPANY_RAPIDAPI;
  if (isPricing) ctaHref = INVOICE_RAPIDAPI;

  // Build nav HTML
  var html = '<nav class="nav"><div class="nav-inner">' +
    '<a href="/" class="nav-logo">' +
      '<img src="/VeriCorp_Logo_128x128.png" width="24" height="24" alt="VeriCorp" style="border-radius:4px">' +
      'Veri<span>Corp</span>' +
    '</a>' +
    '<div class="nav-links" id="navLinks">' +
      '<div class="nav-dropdown">' +
        '<a class="nav-dropdown-trigger" style="color:var(--muted);font-size:.875rem;font-weight:500">Products</a>' +
        '<div class="nav-dropdown-menu">' +
          '<a href="/products/company-verify"' + (activeProduct === 'company-verify' ? ' class="active"' : '') + '>Company Verify<small>VAT validation + enrichment for 28 EU countries</small></a>' +
          '<a href="/products/invoice-extract"' + (activeProduct === 'invoice-extract' ? ' class="active"' : '') + '>Invoice Extract<small>OCR + AI extraction + NIF/IBAN validation</small></a>' +
          '<a href="/products/doc-validate" class="coming-soon' + (activeProduct === 'doc-validate' ? ' active' : '') + '">Doc Validate<small>IBAN, BIC, SEPA, NIF document validation</small></a>' +
        '</div>' +
      '</div>' +
      '<a href="' + pricingHref + '"' + (isPricing ? ' class="active"' : '') + '>Pricing</a>' +
      '<a href="' + playgroundHref + '"' + (isPlayground ? ' class="active"' : '') + playgroundTarget + '>' + playgroundLabel + '</a>' +
      '<a href="' + ctaHref + '" class="nav-cta" id="nav-cta-link">Get API Key</a>' +
    '</div>' +
    '<button class="nav-mobile" aria-label="Menu">&#9776;</button>' +
  '</div></nav>';

  // Inject nav
  var placeholder = document.getElementById('nav-root');
  if (placeholder) {
    placeholder.innerHTML = html;
  } else {
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  // Mobile menu toggle
  var toggle = document.querySelector('.nav-mobile');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // Dropdown toggle
  document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var dropdown = trigger.closest('.nav-dropdown');
      document.querySelectorAll('.nav-dropdown').forEach(function (d) {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(function (d) {
        d.classList.remove('open');
      });
    }
  });
})();
