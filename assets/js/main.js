/* ============================================================
   Schuggies-Ceilidhs — shared site scripts
   Injects header + footer + WhatsApp float on every page,
   wires up mobile nav, accordions, scroll reveals.
   Works from file:// (no fetch, pure DOM) and any host.
   ============================================================ */
(function () {
  "use strict";

  // ---- Central config (edit here, updates whole site) ----
  var SITE = {
    name: "Schuggies-Ceilidhs",
    phone: "01332 498839",
    phoneHref: "tel:01332498839",
    email: "info@schuggies-ceilidhs.co.uk",
    whatsapp: "https://wa.me/447875718702", // real mobile, recovered from the
    // archived /whatsapp-me/ page (078757 18702) — was previously a guess
    // derived from the landline, which would not have reached WhatsApp
    calendlyChat: "https://calendly.com/schuggies-ceilidhs/ceilidh-chat-how-a-ceilidh-will-work-for-your-wedding",
    calendlyAvail: "https://calendly.com/schuggies-ceilidhs/private-ceilidh-check-if-im-available-for-your-big-day",
    address: "Suite 69, Sneinton Market Unit 6, Gedling Street, Nottingham, NG1 1DS",
    // PLACEHOLDER — client has not supplied their Amazon Associates link yet.
    // Paste the storefront URL (with the ?tag=... affiliate ID) here and the
    // disclosure blocks will render a real link instead of "coming soon".
    amazonAffiliate: "",
    // PLACEHOLDER — no newsletter provider chosen yet. While this is empty the
    // footer shows a mailto fallback that works today. Paste the provider's
    // form action URL here (Mailchimp / ConvertKit / Brevo) and the real signup
    // form replaces it sitewide. See data_in/newsletter/newsletter-plan.md
    newsletterAction: "",
    social: {
      facebook:  "https://www.facebook.com/WeddingCeilidhs/",
      instagram: "https://www.instagram.com/Schuggies_Ceilidhs/",
      tiktok:    "https://www.tiktok.com/@schuggiesceilidhs",
      youtube:   "https://www.youtube.com/channel/UCrAF5cdLe0dLjdR9uneOGsA",
      pinterest: "https://uk.pinterest.com/SchuggiesCeilidhs/",
      twitter:   "https://x.com/CeilidhsUK",
      linkedin:  "https://www.linkedin.com/in/schuggies-ceilidhsschuggie-the-ceilidh-caller-11a905184/"
    }
  };

  // Nav definition. `href` is relative; `base` prefix handles pages/ subfolder.
  // `ext: true` marks an off-site link (absolute URL, opens in a new tab).
  // Order follows the client brief. Corporate and About sit in the footer
  // rather than the primary nav — still reachable, just not competing with
  // the weddings/parties story.
  var NAV = [
    { label: "Home",            href: "index.html" },
    { label: "Prices",          href: "pages/prices.html" },
    { label: "Weddings",        href: "pages/weddings.html" },
    { label: "Parties",         href: "pages/parties.html" },
    { label: "Availability",    href: SITE.calendlyAvail, ext: true },
    { label: "FAQs",            href: "pages/faqs.html" },
    { label: "Public Ceilidhs", href: "pages/public-ceilidhs.html" },
    { label: "Contact",         href: "pages/contact.html" }
  ];

  // How deep below the site root are we? Blog posts live at
  // /pages/blog/<slug>.html — two levels — so a fixed "../" would have pointed
  // every nav and footer link on 56 pages at the wrong directory.
  var segs = location.pathname.replace(/^\/|\/$/g, "").split("/");
  var depth = Math.max(0, segs.length - 1);          // index.html -> 0
  var inPages = /\/pages\//.test(location.pathname);
  var base = depth ? new Array(depth + 1).join("../") : "";
  function url(href) {
    if (/^https?:|^tel:|^mailto:/.test(href)) return href;
    // href is defined relative to root; adjust for depth
    if (inPages) return href.replace(/^pages\//, "");
    return href;
  }
  // current page basename for active state
  var current = location.pathname.split("/").pop() || "index.html";

  // ---------- SVG icons ----------
  var ICON = {
    phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1.1l-2.2 2.1z"/></svg>',
    wa: '<svg viewBox="0 0 32 32" fill="#fff"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.4.7 4.6 1.8 6.5L3 29l7.2-2.3c1.8 1 3.9 1.6 6 1.6 7 0 12.5-5.5 12.5-12.5S23 3 16 3zm0 22.6c-1.9 0-3.6-.5-5.1-1.4l-.4-.2-4.3 1.4 1.4-4.2-.3-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.6 4.6-10.2 10.2-10.2S26.2 9.9 26.2 15.5 21.6 25.6 16 25.6zm5.9-7.6c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-1.9-.9-3.1-1.7-4.4-3.8-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-1.2 1.2-1.1 2.9-.1 4.6 1.9 3.1 3.7 4.5 6.9 5.6 2.3.8 2.7.6 3.2.5.7-.1 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.3z"/></svg>',
    fb:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.8C15.7 4.8 14.8 4.7 13.7 4.7c-2.3 0-3.9 1.4-3.9 4V11H7v3h2.8v8H13z"/></svg>',
    ig:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8.9A3.1 3.1 0 1 0 15.1 12 3.1 3.1 0 0 0 12 8.9zm0 5.1A2 2 0 1 1 14 12a2 2 0 0 1-2 2zm4-5.2a.7.7 0 1 1-.7-.7.7.7 0 0 1 .7.7zM19 8a4 4 0 0 0-1.1-2.8A4 4 0 0 0 15 4c-1.1-.1-4.3-.1-5.4 0A4 4 0 0 0 6.8 5.2 4 4 0 0 0 5.7 8c-.1 1.1-.1 4.3 0 5.4A4 4 0 0 0 6.8 16.2 4 4 0 0 0 9 17.3c1.1.1 4.3.1 5.4 0a4 4 0 0 0 2.8-1.1 4 4 0 0 0 1.1-2.8c.1-1.1.1-4.3 0-5.4zm-1.3 6.6a2 2 0 0 1-1.1 1.1c-.8.3-2.6.2-3.5.2s-2.7.1-3.5-.2a2 2 0 0 1-1.1-1.1c-.3-.8-.2-2.6-.2-3.5s-.1-2.7.2-3.5A2 2 0 0 1 8.5 6.9c.8-.3 2.6-.2 3.5-.2s2.7-.1 3.5.2a2 2 0 0 1 1.1 1.1c.3.8.2 2.6.2 3.5s.1 2.7-.2 3.5z"/></svg>',
    tt:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3h-2.6v11.3a2.2 2.2 0 1 1-1.9-2.2V9.4a5 5 0 1 0 4.5 5V8.5a6 6 0 0 0 3.5 1.1V7a3.5 3.5 0 0 1-3.5-3.5z"/></svg>',
    yt:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 8s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-.9C16 5 12 5 12 5s-4 0-6.8.2c-.4 0-1.3 0-2 .9-.6.6-.8 2-.8 2S2.2 9.6 2.2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.8 1.7.8 2.1.9C7 19 12 19 12 19s4 0 6.8-.2c.4 0 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C21.8 9.6 21.6 8 21.6 8zM10 14.6V9.4l4.2 2.6z"/></svg>',
    pin:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.1-1.9 0-2.7l1-4.4s-.3-.5-.3-1.3c0-1.2.7-2.1 1.6-2.1.7 0 1.1.6 1.1 1.2 0 .8-.5 1.9-.7 3-.2.9.4 1.6 1.3 1.6 1.6 0 2.7-2 2.7-4.4 0-1.8-1.2-3.2-3.5-3.2A4 4 0 0 0 7.6 12c0 .8.3 1.4.6 1.8.1.2.2.3.1.5l-.2.9c-.1.3-.2.4-.5.2-1.1-.5-1.7-1.9-1.7-3.1 0-2.5 1.9-4.9 5.4-4.9 2.9 0 5 2 5 4.8 0 2.9-1.8 5.2-4.3 5.2-.8 0-1.6-.4-1.9-1l-.5 2c-.2.7-.7 1.6-1 2.2A9 9 0 1 0 12 3z"/></svg>',
    tw:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.1l-6.8 7.7L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.2-8.2L2.4 3h6.4l4.4 5.8L17.5 3zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3z"/></svg>',
    li:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.9 8.5v10.6H3.6V8.5h3.3zM5.3 3.4c1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8S3.5 6.2 3.5 5.2s.8-1.8 1.8-1.8zM9 8.5h3.1v1.4h.1c.5-.9 1.7-1.7 3.3-1.7 3.4 0 4.1 2.1 4.1 5v5.9h-3.3v-5.2c0-1.3 0-2.9-1.9-2.9s-2.1 1.4-2.1 2.8v5.3H9V8.5z"/></svg>'
  };

  // Every platform in SITE.social must appear here, or it is configured and
  // silently never rendered — which is what had happened to Twitter/X and
  // LinkedIn. To hide one, blank its URL in SITE.social; the loop skips it.
  function socialLinks() {
    var s = SITE.social, out = "";
    var map = [["facebook","fb"],["instagram","ig"],["tiktok","tt"],["youtube","yt"],
               ["pinterest","pin"],["twitter","tw"],["linkedin","li"]];
    var LABEL = { twitter: "X (Twitter)" };
    map.forEach(function (m) {
      var url = s[m[0]];
      if (!url || !ICON[m[1]]) return;
      var label = LABEL[m[0]] || m[0].charAt(0).toUpperCase() + m[0].slice(1);
      out += '<a href="'+url+'" target="_blank" rel="noopener" aria-label="'+label+'">'+ICON[m[1]]+'</a>';
    });
    return out;
  }

  // ---------- Header ----------
  function buildHeader() {
    // External items keep their absolute URL and skip the base prefix and the
    // active check (an off-site link is never the current page).
    function navHref(n) { return n.ext ? n.href : base + n.href; }
    function navAttrs(n) { return n.ext ? ' target="_blank" rel="noopener"' : ''; }

    var links = NAV.map(function (n) {
      var isActive = !n.ext && url(n.href).split("/").pop() === current;
      return '<a href="'+navHref(n)+'"'+navAttrs(n)+(isActive?' aria-current="page"':'')+'>'+n.label+'</a>';
    }).join("");

    var mLinks = NAV.map(function (n) {
      return '<a href="'+navHref(n)+'"'+navAttrs(n)+'>'+n.label+'</a>';
    }).join("");

    return '' +
    '<div class="topbar"><div class="container">' +
      '<a class="topbar__item" href="'+SITE.phoneHref+'">'+ICON.phone+' '+SITE.phone+'</a>' +
      '<a class="topbar__item" href="mailto:'+SITE.email+'">✉️ '+SITE.email+'</a>' +
      '<span class="topbar__item">💷 Prices locked until 2028</span>' +
    '</div></div>' +
    '<header class="site-header"><div class="container"><nav class="nav" aria-label="Primary">' +
      '<a class="brand" href="'+base+'index.html">' +
        '<img class="brand__logo" src="'+base+'assets/images/logo-main.png?b=2" ' +
             'alt="Schuggies-Ceilidhs" width="183" height="160">' +
        '<span class="brand__text">Schuggies-Ceilidhs<small>Scottish Ceilidh Entertainment</small></span>' +
      '</a>' +
      '<div class="nav__links">'+links+'</div>' +
      '<a class="btn btn--chat nav__cta" href="'+SITE.calendlyChat+'" target="_blank" rel="noopener">Book a Chat</a>' +
      '<button class="nav__toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav"><span></span><span></span><span></span></button>' +
    '</nav></div></header>' +
    '<div class="scrim" data-close-nav></div>' +
    '<aside class="mobile-nav" id="mobileNav" aria-label="Mobile">' +
      '<div class="mobile-nav__head"><span class="brand__text">Menu</span>' +
      '<button class="mobile-nav__close" data-close-nav aria-label="Close menu">✕</button></div>' +
      mLinks +
      '<a class="btn btn--chat btn--block" href="'+SITE.calendlyChat+'" target="_blank" rel="noopener">Book a Chat</a>' +
      '<a class="btn btn--ghost btn--block" href="'+SITE.phoneHref+'" class="u-mt-1">Call '+SITE.phone+'</a>' +
    '</aside>';
  }

  // ---------- Scroll to top ----------
  function buildToTop() {
    var b = document.createElement("button");
    b.className = "to-top";
    b.type = "button";
    b.setAttribute("aria-label", "Back to top");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" ' +
                  'stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    b.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    document.body.appendChild(b);
    return b;
  }

  // ---------- Newsletter ----------
  // Renders in the footer, so it appears on every page.
  // No provider is configured yet (SITE.newsletterAction is ""), so instead of
  // a form that silently posts nowhere, it falls back to a pre-filled mailto —
  // that actually works today. Paste the provider's action URL into
  // SITE.newsletterAction and the real form takes over, no other edits.
  function newsletterForm() {
    var head = '<h4>Subscribe to updates</h4>' +
      '<p class="nl-note">Monthly ceilidh dates, planning tips and free resources. No spam, ever.</p>';

    if (!SITE.newsletterAction) {
      var subj = encodeURIComponent("Add me to the ceilidh newsletter");
      var body = encodeURIComponent("Hi Schuggie,\n\nPlease add me to your newsletter.\n\nThanks!");
      return head +
        '<a class="btn btn--chat btn--block nl-cta" href="mailto:' + SITE.email +
          '?subject=' + subj + '&body=' + body + '">Subscribe by email</a>' +
        '<p class="nl-consent">You can unsubscribe at any time. See our ' +
          '<a href="' + base + 'pages/privacy.html">Privacy Policy</a>.</p>';
    }

    return head +
      '<form class="nl-form" action="' + SITE.newsletterAction + '" method="post" target="_blank" novalidate>' +
        '<label class="nl-label" for="nl-email">Email address</label>' +
        '<input id="nl-email" name="EMAIL" type="email" required autocomplete="email" placeholder="Enter your email">' +
        '<button class="btn btn--chat btn--block" type="submit">Subscribe</button>' +
      '</form>' +
      '<p class="nl-consent">You can unsubscribe at any time. See our ' +
        '<a href="' + base + 'pages/privacy.html">Privacy Policy</a>.</p>';
  }

  // ---------- Affiliate disclosure ----------
  // Required (FTC / UK ASA) wherever affiliate links appear. Sitewide in the
  // footer is the safe placement — the Wedding Toolkit and blog posts carry
  // Amazon links, and a disclosure buried on one page is easy to miss.
  function affiliateNote() {
    var link = SITE.amazonAffiliate
      ? ' <a href="' + SITE.amazonAffiliate + '" target="_blank" rel="noopener sponsored">See my Amazon picks</a>.'
      : '';
    return '<div class="footer-affiliate">' +
      '<p><b>Affiliate disclosure.</b> As an Amazon Associate, I earn from qualifying ' +
      'purchases. Some links on this site may be affiliate links, at no extra cost to you.' + link + '</p>' +
      '</div>';
  }

  // ---------- Footer ----------
  function buildFooter() {
    // Explicit list rather than a NAV slice: NAV now contains an external
    // item (Availability) that must not get the base prefix, and the footer
    // is where About and Corporate live now they're out of the primary nav.
    var EXPLORE = [
      { label: "Prices",          href: "pages/prices.html" },
      { label: "Weddings",        href: "pages/weddings.html" },
      { label: "Parties",         href: "pages/parties.html" },
      { label: "Public Ceilidhs", href: "pages/public-ceilidhs.html" },
      { label: "About Schuggie",  href: "pages/about.html" },
      { label: "Corporate",       href: "pages/corporate.html" },
      { label: "Contact",         href: "pages/contact.html" }
    ];
    var col2 = EXPLORE.map(function(n){return '<li><a href="'+base+n.href+'">'+n.label+'</a></li>';}).join("");
    // "More info" list — mirrors the old site. External items open in a new tab;
    // pages not yet built in this clone point at the live site so links always work.
    // Every item is now a local page. Only Calendly stays external — it is a
    // third-party booking service, not content we host. Nothing in the footer
    // depends on schuggies-ceilidhs.co.uk staying up any more.
    var MOREINFO = [
      { label: "How Much Does It Cost?",   href: base + "pages/prices.html" },
      { label: "Availability",             href: SITE.calendlyAvail, ext: true },
      { label: "About Schuggies-Ceilidhs", href: base + "pages/about.html" },
      { label: "Corporate",                href: base + "pages/corporate.html" },
      { label: "Book a Chat",              href: SITE.calendlyChat, ext: true },
      { label: "FAQs",                     href: base + "pages/faqs.html" },
      { label: "Testimonials",             href: base + "pages/testimonials.html" },
      { label: "Blogs",                    href: base + "pages/blogs.html" },
      { label: "Free Guides & Resources",  href: base + "pages/guides.html" },
      // The Nottingham Ceilidh Club content was built as public-ceilidhs.html
      // during the migration — this points there rather than duplicating it.
      { label: "Nottingham Ceilidh Club",  href: base + "pages/public-ceilidhs.html" },
      { label: "Diversity & Enrichment",   href: base + "pages/diversity-enrichment.html" },
      { label: "Ceilidh Quick Links",      href: base + "pages/ceilidh-quick-links.html" }
    ];
    var col3 = MOREINFO.map(function(n){
      var t = n.ext ? ' target="_blank" rel="noopener"' : '';
      return '<li><a href="'+n.href+'"'+t+'>'+n.label+'</a></li>';
    }).join("");
    return '' +
    '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
        '<div>' +
          '<a class="brand" href="'+base+'index.html" class="u-mb-2">' +
            '<img class="brand__logo brand__logo--footer" src="'+base+'assets/images/logo-main.png?b=2" ' +
                 'alt="Schuggies-Ceilidhs" width="183" height="160">' +
            '<span class="brand__text brand__text--footer">Schuggies-Ceilidhs<small>Est. 2008</small></span>' +
          '</a>' +
          '<p>Authentic Scottish ceilidh entertainment for weddings, parties & corporate events across the UK. Over 550 events, 220+ weddings.</p>' +
          '<div class="social-row">'+socialLinks()+'</div>' +
        '</div>' +
        '<div><h4>Explore</h4><ul class="footer-links">'+col2+'</ul></div>' +
        '<div><h4>More info</h4><ul class="footer-links">'+col3+'</ul></div>' +
        '<div><h4>Get in touch</h4><ul class="footer-links">' +
          '<li><a href="'+SITE.phoneHref+'">'+SITE.phone+'</a></li>' +
          '<li><a href="mailto:'+SITE.email+'">'+SITE.email+'</a></li>' +
          '<li>'+SITE.address+'</li>' +
        '</ul>' +
        '<a class="btn btn--sage u-mt-2" href="'+SITE.calendlyAvail+'" target="_blank" rel="noopener">Check Availability</a>' +
        '</div>' +
        '<div>' + newsletterForm() + '</div>' +
      '</div>' +
      affiliateNote() +
      '<div class="footer-bottom">' +
        '<span>© '+ (new Date().getFullYear()) +' Schuggies-Ceilidhs Limited · Company No. 12395804</span>' +
        '<span><a href="'+base+'pages/privacy.html">Privacy</a> · <a href="'+base+'pages/terms.html">Terms</a></span>' +
      '</div>' +
    '</div></footer>' +
    '<div class="wa-float">' +
      '<span class="wa-float__label">Contact me</span>' +
      '<a class="wa-float__btn" href="'+SITE.whatsapp+'" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">'+ICON.wa+'</a>' +
    '</div>';
  }

  // ---------- Wire interactions ----------
  function wire() {
    var toggle = document.querySelector(".nav__toggle");
    var drawer = document.getElementById("mobileNav");
    var scrim  = document.querySelector(".scrim");
    function open(){ drawer.classList.add("is-open"); scrim.classList.add("is-open"); document.body.classList.add("no-scroll"); toggle.setAttribute("aria-expanded","true"); }
    function close(){ drawer.classList.remove("is-open"); scrim.classList.remove("is-open"); document.body.classList.remove("no-scroll"); toggle.setAttribute("aria-expanded","false"); }
    if (toggle) toggle.addEventListener("click", open);
    document.querySelectorAll("[data-close-nav]").forEach(function(el){ el.addEventListener("click", close); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") close(); });

    // header shadow on scroll
    var header = document.querySelector(".site-header");
    var toTop  = buildToTop();
    function onScroll(){
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
      // Scroll-to-top appears only after a full viewport of scrolling, so it
      // never competes for attention at the top of the page.
      if (toTop) toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight);
    }
    window.addEventListener("scroll", onScroll, { passive:true });
    onScroll();   // a page can load already scrolled (refresh, deep link, back)

    // accordions
    document.querySelectorAll(".acc__q").forEach(function(q){
      q.addEventListener("click", function(){
        var acc = q.closest(".acc");
        var a = acc.querySelector(".acc__a");
        var open = acc.classList.toggle("is-open");
        a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
      });
    });

    // scroll reveal
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });

    // ---- Lightweight conversion tracking (provider-agnostic) ----
    // Auto-tracks clicks on buttons + hand-off links (Calendly, tel, mailto, WhatsApp).
    // Pushes to window.dataLayer so Google Tag Manager / GA4 can pick it up with zero
    // extra tagging; also console-logs so you can verify without an analytics account.
    window.dataLayer = window.dataLayer || [];
    function track(event, detail){
      window.dataLayer.push(Object.assign({ event: event }, detail));
      if (window.console) console.log("[track]", event, detail);
    }
    document.addEventListener("click", function(e){
      var a = e.target.closest("a, button"); if (!a) return;
      var href = (a.getAttribute && a.getAttribute("href")) || "";
      var label = (a.textContent || "").trim().slice(0, 60);
      var kind = null;
      if (/calendly\.com/.test(href)) kind = "book_calendly";
      else if (/^tel:/.test(href)) kind = "call_phone";
      else if (/^mailto:/.test(href)) kind = "email_click";
      else if (/wa\.me|whatsapp/i.test(href)) kind = "whatsapp_click";
      else if (a.classList && a.classList.contains("btn")) kind = "cta_click";
      if (kind) track(kind, { label: label, href: href });
    }, true);

    // contact form (front-end only demo — replace action with real endpoint)
    var form = document.getElementById("contactForm");
    if (form) form.addEventListener("submit", function(e){
      e.preventDefault();
      var note = document.getElementById("formNote");
      if (note) { note.textContent = "Thanks — your message has been sent. I'll get back to you shortly. For anything urgent, call 01332 498839."; note.style.display="block"; }
      form.reset();
    });
  }

  // ---------- Mount ----------
  function mount(){
    var h = document.getElementById("site-header-mount");
    var f = document.getElementById("site-footer-mount");
    if (h) h.innerHTML = buildHeader();
    if (f) f.innerHTML = buildFooter();
    wire();
    // inject the Ollama chatbot (single source, path-aware)
    if (!document.querySelector('script[data-cbot]')) {
      var s = document.createElement("script");
      s.src = base + "assets/js/chatbot.js?b=1";
      s.setAttribute("data-cbot", "1");
      document.body.appendChild(s);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
