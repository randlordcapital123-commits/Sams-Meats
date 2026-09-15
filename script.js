/* ============================================================
   SHEBA TOWN STUDENT ACCOMMODATION
   Main application script
   ------------------------------------------------------------
   All content (services, gallery, logo, hero image and business
   information) is persisted in the browser's localStorage.
   No cloud storage, no external database.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. STORAGE KEYS & DEFAULTS
     ---------------------------------------------------------- */
  const STORAGE_KEY    = 'shebaTownData_v1';
  const AUTH_KEY       = 'shebaTownAuth_v1';
  const PASSWORD_KEY   = 'shebaTownPassword_v1';
  const DEFAULT_PASSWORD = 'sheba2024';

  const DEFAULT_DATA = {
    business: {
      name:         'Sheba Town Student Accommodation',
      shortName:    'Sheba Town',
      tagline:      'Student Accommodation',
      phone:        '+27670030937',
      phoneDisplay: '+27 67 003 0937',
      whatsapp:     '+27670030937',
      email:        'stay@shebatown.co.za',
      address:      'Gauteng, South Africa',
      heroTitle:    'Your Home Away From Home in Gauteng',
      heroSubtitle: 'Safe, modern and affordable student accommodation built for focused living. En-suite rooms, uncapped Wi-Fi, study lounges and 24/7 security - minutes from campus.',
      about:        'Sheba Town Student Accommodation is a modern, secure and fully managed residence in Gauteng, designed around the real needs of students. From the moment you move in, everything is set up so you can focus on your studies - reliable power, fast internet, clean shared spaces and a community that feels like family.'
    },
    logo:       '',
    heroImage:  '',
    services: [
      {
        id: 's1',
        name: 'En-suite Single Room',
        price: 'R3 200',
        unit: 'per month',
        description: 'Private room with your own bathroom, single bed, study desk, wardrobe and bookshelf. Includes water, electricity, uncapped Wi-Fi and weekly cleaning of shared areas.',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 's2',
        name: 'Shared Twin Room',
        price: 'R2 100',
        unit: 'per person / month',
        description: 'Spacious twin room shared with one other student. Two beds, two study desks, large wardrobe and shared bathroom. Ideal for friends or first-year students.',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 's3',
        name: 'Premium Studio Apartment',
        price: 'R4 800',
        unit: 'per month',
        description: 'Fully self-contained studio with private kitchenette, en-suite bathroom, queen bed and dedicated workspace. Perfect for postgraduate students who need privacy.',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 's4',
        name: 'Meal Plan Add-on',
        price: 'R1 450',
        unit: 'per month',
        description: 'Two cooked meals per day prepared on-site, Monday to Friday, plus weekend breakfast. Balanced menus with vegetarian and halaal options available.',
        image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 's5',
        name: 'Laundry Service',
        price: 'R380',
        unit: 'per month',
        description: 'Weekly washing, drying and folding of your personal laundry. On-site machines, no queues, and clean linen returned to your room every Friday.',
        image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 's6',
        name: 'Campus Shuttle Package',
        price: 'R520',
        unit: 'per month',
        description: 'Scheduled morning and afternoon transport to major Gauteng campuses and nearby shopping centres. Live tracking and dedicated student drivers.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80'
      }
    ],
    gallery: [
      { id: 'g1', src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80', caption: 'Communal lounge' },
      { id: 'g2', src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80', caption: 'Study desk area' },
      { id: 'g3', src: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=900&q=80', caption: 'Shared kitchen' },
      { id: 'g4', src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80', caption: 'Single room' },
      { id: 'g5', src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80', caption: 'Studio apartment' },
      { id: 'g6', src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80', caption: 'Group study room' },
      { id: 'g7', src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80', caption: 'Reading corner' },
      { id: 'g8', src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80', caption: 'Living space' }
    ]
  };

  /* ----------------------------------------------------------
     2. STATE
     ---------------------------------------------------------- */
  let data               = null;
  let editingServiceId   = null;
  let pendingServiceImage = '';
  let lightboxIndex      = 0;
  let galleryLightboxItems = [];

  /* ----------------------------------------------------------
     3. TINY DOM HELPERS
     ---------------------------------------------------------- */
  function $(sel, root)  { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function digitsOnly(phone) { return String(phone || '').replace(/[^\d]/g, ''); }

  function waLink(message) {
    var num = digitsOnly(data.business.whatsapp);
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(message || '');
  }

  function telLink()  { return 'tel:' + String(data.business.phone || '').replace(/\s/g, ''); }
  function mailLink() { return 'mailto:' + (data.business.email || ''); }

  function initials(str) {
    var parts = String(str || '').trim().split(/\s+/);
    if (!parts.length || !parts[0]) return 'ST';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function whatsappIcon() {
    return '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">' +
      '<path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.5-.1-.7.2-.7.9-.9 1.1-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.7l.6-.7c.2-.2.2-.4.3-.6s0-.4 0-.5l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 1.9 3 4.7 4.2 2.3 1 2.8.8 3.3.7.5 0 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3s-.2-.2-.5-.3zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2z"/></svg>';
  }

  /* ----------------------------------------------------------
     4. TOASTS
     ---------------------------------------------------------- */
  function toast(message, type) {
    var wrap = $('#toastWrap');
    if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }, 2900);
  }

  /* ----------------------------------------------------------
     5. PERSISTENCE
     ---------------------------------------------------------- */
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        data = deepClone(DEFAULT_DATA);
        saveData(false);
        return;
      }
      var parsed = JSON.parse(raw);
      data = {
        business: Object.assign({}, DEFAULT_DATA.business, parsed.business || {}),
        logo:      parsed.logo || '',
        heroImage: parsed.heroImage || '',
        services:  Array.isArray(parsed.services) ? parsed.services : deepClone(DEFAULT_DATA.services),
        gallery:   Array.isArray(parsed.gallery)  ? parsed.gallery  : deepClone(DEFAULT_DATA.gallery)
      };
    } catch (err) {
      data = deepClone(DEFAULT_DATA);
    }
  }

  function saveData(notify) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (notify !== false) toast('Changes saved', 'success');
      updateStorageBar();
      return true;
    } catch (err) {
      toast('Storage full. Remove some images and try again.', 'error');
      return false;
    }
  }

  /* ----------------------------------------------------------
     6. IMAGE COMPRESSION
     ---------------------------------------------------------- */
  function compressImage(file, maxWidth, quality, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width;
        var h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        try {
          callback(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          callback(e.target.result);
        }
      };
      img.onerror = function () { callback(e.target.result); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function readImageFile(file, maxWidth, cb) {
    if (!file || !/^image\//.test(file.type)) {
      toast('Please choose an image file', 'error');
      return;
    }
    compressImage(file, maxWidth || 1200, 0.82, cb);
  }

  /* ----------------------------------------------------------
     7. RENDER - BUSINESS INFO
     ---------------------------------------------------------- */
  function applyLogo(imgEl, initialsEl) {
    if (!imgEl || !initialsEl) return;
    if (data.logo) {
      imgEl.src = data.logo;
      imgEl.hidden = false;
      initialsEl.style.display = 'none';
    } else {
      imgEl.removeAttribute('src');
      imgEl.hidden = true;
      initialsEl.style.display = '';
    }
  }

  function applyHeroImage() {
    var hero = $('#home');
    if (!hero) return;
    if (data.heroImage) {
      hero.style.backgroundImage =
        "linear-gradient(115deg,rgba(11,16,32,.93) 0%,rgba(11,16,32,.78) 40%,rgba(59,46,219,.55) 100%), url('" +
        data.heroImage + "')";
      hero.style.backgroundSize = 'cover, cover';
      hero.style.backgroundPosition = 'center, center';
      hero.style.backgroundRepeat = 'no-repeat, no-repeat';
    } else {
      hero.style.backgroundImage = '';
      hero.style.backgroundSize = '';
      hero.style.backgroundPosition = '';
      hero.style.backgroundRepeat = '';
    }
  }

  function renderBusinessInfo() {
    var b = data.business;

    var topAddr = $('#topbarAddress');       if (topAddr) topAddr.textContent = b.address;
    var topPhone = $('#topbarPhone');        if (topPhone) topPhone.setAttribute('href', telLink());
    var topPhoneTxt = $('#topbarPhoneText'); if (topPhoneTxt) topPhoneTxt.textContent = b.phoneDisplay;
    var topMail = $('#topbarMail');          if (topMail) topMail.setAttribute('href', mailLink());
    var topMailTxt = $('#topbarMailText');   if (topMailTxt) topMailTxt.textContent = b.email;

    var brandName = $('#brandName');         if (brandName) brandName.textContent = b.shortName;
    var brandTag  = $('#brandTagline');      if (brandTag)  brandTag.textContent  = b.tagline;
    var brandInit = $('#brandInitials');     if (brandInit) brandInit.textContent = initials(b.shortName);

    var heroTitle = $('#heroTitle');
    if (heroTitle) {
      heroTitle.innerHTML = escapeHtml(b.heroTitle).replace(
        /Gauteng/,
        '<span class="grad-text">Gauteng</span>'
      );
    }

    var heroSub = $('#heroSubtitle');    if (heroSub) heroSub.textContent = b.heroSubtitle;
    var aboutT  = $('#aboutText');       if (aboutT)  aboutT.textContent  = b.about;

    var cPhone = $('#contactPhoneText');   if (cPhone) cPhone.textContent = b.phoneDisplay;
    var cWa    = $('#contactWaText');      if (cWa)    cWa.textContent    = b.phoneDisplay;
    var cMail  = $('#contactEmailText');   if (cMail)  cMail.textContent  = b.email;
    var cAddr  = $('#contactAddressText'); if (cAddr)  cAddr.textContent  = b.address;

    var fName = $('#footerName');        if (fName) fName.textContent = b.name;
    var fAbout = $('#footerAbout');      if (fAbout) fAbout.textContent = 'Safe, modern and affordable student housing in ' + b.address + '.';
    var fPhone = $('#footerPhone');      if (fPhone) { fPhone.setAttribute('href', telLink()); fPhone.textContent = b.phoneDisplay; }
    var fMail  = $('#footerMail');       if (fMail)  { fMail.setAttribute('href', mailLink()); fMail.textContent = b.email; }
    var fAddr  = $('#footerAddress');    if (fAddr)  fAddr.textContent = b.address;
    var fInit  = $('#footerInitials');   if (fInit)  fInit.textContent = initials(b.shortName);
    var fCopy  = $('#footerCopyName');   if (fCopy)  fCopy.textContent = b.name;
    var yearEl = $('#year');             if (yearEl) yearEl.textContent = new Date().getFullYear();

    applyLogo($('#brandLogo'),  $('#brandInitials'));
    applyLogo($('#footerLogo'), $('#footerInitials'));

    /* All WhatsApp links share the same general message */
    var generalMsg = 'Hello ' + b.shortName + ', I would like to enquire about student accommodation.';
    ['#navWa', '#navWaMobile', '#heroWa', '#aboutWa', '#servicesWa',
     '#contactWa', '#footerWa', '#floatWa'].forEach(function (sel) {
      var el = $(sel);
      if (el) {
        el.setAttribute('href', waLink(generalMsg));
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    });

    /* Call + email links */
    ['#heroCall', '#contactCall'].forEach(function (sel) {
      var el = $(sel);
      if (el) el.setAttribute('href', telLink());
    });
    var contactMail = $('#contactMail');
    if (contactMail) contactMail.setAttribute('href', mailLink());

    applyHeroImage();
    document.title = b.name + ' | Secure Student Housing in ' + b.address;
  }

  /* ----------------------------------------------------------
     8. RENDER - SERVICES
     ---------------------------------------------------------- */
  function renderServices() {
    var grid = $('#servicesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    data.services.forEach(function (svc) {
      var msg = 'Hello ' + data.business.shortName + ', I am interested in the "' + svc.name +
                '" (' + svc.price + (svc.unit ? ' ' + svc.unit : '') + '). Please send me more information.';

      var card = document.createElement('article');
      card.className = 'service-card';
      card.innerHTML =
        '<div class="service-media">' +
          '<img src="' + escapeHtml(svc.image) + '" alt="' + escapeHtml(svc.name) + '" loading="lazy" />' +
          '<div class="service-price"><b>' + escapeHtml(svc.price) + '</b>' +
            (svc.unit ? ' ' + escapeHtml(svc.unit) : '') +
          '</div>' +
        '</div>' +
        '<div class="service-body">' +
          '<h3>' + escapeHtml(svc.name) + '</h3>' +
          '<p>' + escapeHtml(svc.description) + '</p>' +
          '<a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="' +
            escapeHtml(waLink(msg)) + '">' +
            whatsappIcon() + 'WhatsApp enquiry' +
          '</a>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  /* ----------------------------------------------------------
     9. RENDER - GALLERY
     ---------------------------------------------------------- */
  function renderGallery() {
    var grid = $('#galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    galleryLightboxItems = data.gallery.slice();

    data.gallery.forEach(function (item, i) {
      var div = document.createElement('div');
      div.className = 'gallery-item';
      div.setAttribute('data-index', String(i));
      div.innerHTML =
        '<img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.caption || 'Accommodation photo') + '" loading="lazy" />' +
        '<span class="gallery-cap">' + escapeHtml(item.caption || '') + '</span>';
      div.addEventListener('click', (function (idx) {
        return function () { openLightbox(idx); };
      })(i));
      grid.appendChild(div);
    });
  }

  /* ----------------------------------------------------------
     10. LIGHTBOX
     ---------------------------------------------------------- */
  function openLightbox(index) {
    if (!galleryLightboxItems.length) return;
    lightboxIndex = (index + galleryLightboxItems.length) % galleryLightboxItems.length;
    var item = galleryLightboxItems[lightboxIndex];
    var img = $('#lbImage');
    var cap = $('#lbCaption');
    if (img) { img.src = item.src; img.alt = item.caption || 'Gallery image'; }
    if (cap) cap.textContent = item.caption || '';
    var lb = $('#lightbox');
    if (!lb) return;
    lb.classList.add('show');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    lb.classList.remove('show');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function navLightbox(dir) { openLightbox(lightboxIndex + dir); }

  function initLightboxControls() {
    var closeBtn = $('#lbClose');
    var prevBtn  = $('#lbPrev');
    var nextBtn  = $('#lbNext');
    var lb       = $('#lightbox');
    if (!lb) return;

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn)  prevBtn.addEventListener('click', function () { navLightbox(-1); });
    if (nextBtn)  nextBtn.addEventListener('click', function () { navLightbox(1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('show')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    });
  }

  /* ----------------------------------------------------------
     11. NAVIGATION
     ---------------------------------------------------------- */
  function initNav() {
    var hamburger = $('#hamburger');
    var navLinks  = $('#navLinks');
    var backdrop  = $('#navBackdrop');
    if (!hamburger || !navLinks || !backdrop) return;

    function closeMenu() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('show');
    }

    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      backdrop.classList.toggle('show', open);
    });

    backdrop.addEventListener('click', closeMenu);

    $$('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 860) closeMenu();
      });
    });

    var header = $('#siteHeader');
    window.addEventListener('scroll', function () {
      if (!header) return;
      if (window.scrollY > 12) header.classList.add('scrolled');
      else                     header.classList.remove('scrolled');
    });

    var sections = $$('section[id]');
    window.addEventListener('scroll', function () {
      var pos = window.scrollY + 140;
      var current = 'home';
      sections.forEach(function (sec) {
        if (sec.offsetTop <= pos) current = sec.id;
      });
      $$('.nav-link').forEach(function (link) {
        var href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === '#' + current);
      });
    });
  }

  /* ----------------------------------------------------------
     12. REVEAL + COUNTERS
     ---------------------------------------------------------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { obs.observe(el); });
  }

  function initCounters() {
    var counters = $$('.stat strong[data-count]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var duration = 1400;
        var start = performance.now();
        function step(now) {
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ----------------------------------------------------------
     13. CONTACT FORM
     ---------------------------------------------------------- */
  function populateInterestSelect() {
    var select = $('#cfInterest');
    if (!select) return;
    select.innerHTML = '';
    data.services.forEach(function (svc) {
      var opt = document.createElement('option');
      opt.value = svc.name;
      opt.textContent = svc.name + ' - ' + svc.price + (svc.unit ? ' ' + svc.unit : '');
      select.appendChild(opt);
    });
    var optGeneral = document.createElement('option');
    optGeneral.value = 'General enquiry';
    optGeneral.textContent = 'General enquiry';
    select.appendChild(optGeneral);
  }

  function initContactForm() {
    var form = $('#contactForm');
    if (!form) return;

    populateInterestSelect();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name     = $('#cfName').value.trim();
      var phone    = $('#cfPhone').value.trim();
      var interest = $('#cfInterest').value;
      var message  = $('#cfMessage').value.trim();

      if (!name || !phone) {
        toast('Please enter your name and phone number', 'error');
        return;
      }

      var text =
        'Hello ' + data.business.shortName + ',\n\n' +
        'My name is ' + name + '.\n' +
        'Phone: ' + phone + '\n' +
        'Interested in: ' + interest + '\n' +
        (message ? '\nMessage: ' + message + '\n' : '') +
        '\nPlease send me availability and pricing.';

      window.open(waLink(text), '_blank', 'noopener');
      form.reset();
      populateInterestSelect();
    });

    window.addEventListener('sheba:services-updated', populateInterestSelect);
  }

  /* ----------------------------------------------------------
     14. ADMIN - OPEN / CLOSE / LOGIN
     ---------------------------------------------------------- */
  function initAdmin() {
    var overlay  = $('#adminOverlay');
    var loginBox = $('#adminLogin');
    var dashBox  = $('#adminDash');
    var logoutBtn = $('#adminLogout');
    if (!overlay || !loginBox || !dashBox) return;

    function openAdmin() {
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (sessionStorage.getItem(AUTH_KEY) === 'true') showDashboard();
      else showLogin();
    }

    function closeAdmin() {
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    }

    function showLogin() {
      loginBox.style.display = '';
      dashBox.hidden = true;
      if (logoutBtn) logoutBtn.hidden = true;
      var err = $('#loginError'); if (err) err.hidden = true;
      var pw  = $('#adminPassword'); if (pw) pw.value = '';
      var hint = $('#loginHint'); if (hint) hint.hidden = localStorage.getItem(PASSWORD_KEY) !== null;
    }

    function showDashboard() {
      loginBox.style.display = 'none';
      dashBox.hidden = false;
      if (logoutBtn) logoutBtn.hidden = false;
      renderAdminServices();
      renderAdminGallery();
      renderAdminBranding();
      fillBusinessForm();
      updateStorageBar();
    }

    $$('[data-open-admin]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openAdmin();
      });
    });

    var closeBtn = $('#adminClose');     if (closeBtn)     closeBtn.addEventListener('click', closeAdmin);
    var viewBtn  = $('#adminViewSite');  if (viewBtn)      viewBtn.addEventListener('click', closeAdmin);

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem(AUTH_KEY);
        toast('Logged out');
        closeAdmin();
      });
    }

    var pwToggle = $('#pwToggle');
    if (pwToggle) {
      pwToggle.addEventListener('click', function () {
        var input = $('#adminPassword');
        if (!input) return;
        var isPw = input.type === 'password';
        input.type = isPw ? 'text' : 'password';
        this.textContent = isPw ? 'Hide' : 'Show';
      });
    }

    var loginForm = $('#loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var stored  = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
        var entered = $('#adminPassword').value;
        if (entered === stored) {
          sessionStorage.setItem(AUTH_KEY, 'true');
          showDashboard();
          toast('Welcome back', 'success');
        } else {
          var err = $('#loginError'); if (err) err.hidden = false;
          var pw  = $('#adminPassword'); if (pw) pw.value = '';
        }
      });
    }

    $$('#adminTabs .tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('#adminTabs .tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var name = tab.getAttribute('data-tab');
        $$('.panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === name);
        });
        if (name === 'security') updateStorageBar();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if ($('#serviceModal').classList.contains('show'))      closeServiceModal();
      else if ($('#lightbox').classList.contains('show'))     closeLightbox();
      else if (overlay.classList.contains('show'))            closeAdmin();
    });
  }

  /* ----------------------------------------------------------
     15. ADMIN - SERVICES LIST
     ---------------------------------------------------------- */
  function renderAdminServices() {
    var list = $('#adminServiceList');
    if (!list) return;
    list.innerHTML = '';

    if (!data.services.length) {
      list.innerHTML = '<p style="color:rgba(255,255,255,.4)">No services yet. Click "Add service" to create one.</p>';
      return;
    }

    data.services.forEach(function (svc) {
      var row = document.createElement('div');
      row.className = 'admin-row';
      row.innerHTML =
        '<img class="admin-row-img" src="' + escapeHtml(svc.image) + '" alt="" />' +
        '<div class="admin-row-body">' +
          '<h4>' + escapeHtml(svc.name) + '</h4>' +
          '<p>' + escapeHtml(svc.description) + '</p>' +
          '<div class="admin-row-meta">' +
            '<span>' + escapeHtml(svc.price) + (svc.unit ? ' ' + escapeHtml(svc.unit) : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="admin-row-actions">' +
          '<button class="btn btn-sm btn-ghost" data-edit="' + svc.id + '">Edit</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + svc.id + '">Delete</button>' +
        '</div>';

      row.querySelector('[data-edit]').addEventListener('click', function () {
        openServiceModal(svc.id);
      });
      row.querySelector('[data-del]').addEventListener('click', function () {
        deleteService(svc.id);
      });

      list.appendChild(row);
    });
  }

  function deleteService(id) {
    var svc = data.services.find(function (s) { return s.id === id; });
    if (!svc) return;
    if (!confirm('Delete "' + svc.name + '"? This cannot be undone.')) return;
    data.services = data.services.filter(function (s) { return s.id !== id; });
    saveData(false);
    renderAdminServices();
    renderServices();
    window.dispatchEvent(new Event('sheba:services-updated'));
    toast('Service deleted');
  }

  /* ----------------------------------------------------------
     16. ADMIN - SERVICE MODAL
     ---------------------------------------------------------- */
  function openServiceModal(id) {
    editingServiceId = id || null;
    pendingServiceImage = '';
    var modal = $('#serviceModal');
    if (!modal) return;

    if (id) {
      var svc = data.services.find(function (s) { return s.id === id; });
      if (!svc) return;
      $('#serviceModalTitle').textContent = 'Edit service';
      $('#svcId').value    = svc.id;
      $('#svcName').value  = svc.name;
      $('#svcPrice').value = svc.price;
      $('#svcUnit').value  = svc.unit || '';
      $('#svcDesc').value  = svc.description;
      pendingServiceImage  = svc.image;
      updateSvcPreview(svc.image);
    } else {
      $('#serviceModalTitle').textContent = 'Add service';
      $('#serviceForm').reset();
      $('#svcId').value = '';
      updateSvcPreview('');
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeServiceModal() {
    var modal = $('#serviceModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    editingServiceId = null;
    pendingServiceImage = '';
  }

  function updateSvcPreview(src) {
    var box = $('#svcPreview');
    if (!box) return;
    box.innerHTML = src ? '<img src="' + escapeHtml(src) + '" alt="Preview" />' : '';
  }

  function initServiceModal() {
    var addBtn  = $('#addServiceBtn');
    var closeBt = $('#serviceModalClose');
    var cancel  = $('#serviceCancel');
    var form    = $('#serviceForm');
    var drop    = $('#svcDrop');
    var input   = $('#svcImageInput');

    if (addBtn)  addBtn.addEventListener('click', function () { openServiceModal(null); });
    if (closeBt) closeBt.addEventListener('click', closeServiceModal);
    if (cancel)  cancel.addEventListener('click', closeServiceModal);

    if (drop && input) {
      drop.addEventListener('click', function () { input.click(); });
      drop.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          input.click();
        }
      });
      ['dragenter', 'dragover'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) {
          e.preventDefault();
          drop.classList.add('drag');
        });
      });
      ['dragleave', 'drop'].forEach(function (ev) {
        drop.addEventListener(ev, function (e) {
          e.preventDefault();
          drop.classList.remove('drag');
        });
      });
      drop.addEventListener('drop', function (e) {
        var file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleSvcFile(file);
      });
      input.addEventListener('change', function () {
        handleSvcFile(this.files && this.files[0]);
        this.value = '';
      });
    }

    function handleSvcFile(file) {
      if (!file) return;
      readImageFile(file, 1000, function (dataUrl) {
        pendingServiceImage = dataUrl;
        updateSvcPreview(dataUrl);
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name        = $('#svcName').value.trim();
        var price       = $('#svcPrice').value.trim();
        var unit        = $('#svcUnit').value.trim();
        var description = $('#svcDesc').value.trim();

        if (!name || !price || !description) {
          toast('Please fill in name, price and description', 'error');
          return;
        }

        var fallback = (data.services[0] && data.services[0].image) || DEFAULT_DATA.services[0].image;
        var image = pendingServiceImage || fallback;

        if (editingServiceId) {
          var svc = data.services.find(function (s) { return s.id === editingServiceId; });
          if (svc) {
            svc.name        = name;
            svc.price       = price;
            svc.unit        = unit;
            svc.description = description;
            svc.image       = image;
          }
        } else {
          data.services.push({
            id: uid('svc'),
            name: name,
            price: price,
            unit: unit,
            description: description,
            image: image
          });
        }

        saveData();
        renderAdminServices();
        renderServices();
        window.dispatchEvent(new Event('sheba:services-updated'));
        closeServiceModal();
      });
    }
  }

  /* ----------------------------------------------------------
     17. ADMIN - GALLERY
     ---------------------------------------------------------- */
  function renderAdminGallery() {
    var wrap = $('#adminGallery');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (!data.gallery.length) {
      wrap.innerHTML = '<p style="color:rgba(255,255,255,.4);grid-column:1/-1">No gallery images yet. Drop photos above to add them.</p>';
      return;
    }

    data.gallery.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'admin-gal-item';
      div.innerHTML =
        '<img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.caption || '') + '" />' +
        '<button class="admin-gal-del" aria-label="Delete image">' +
          '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4">' +
          '<path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>';
      div.querySelector('.admin-gal-del').addEventListener('click', function (e) {
        e.stopPropagation();
        if (!confirm('Delete this gallery image?')) return;
        data.gallery = data.gallery.filter(function (g) { return g.id !== item.id; });
        saveData(false);
        renderAdminGallery();
        renderGallery();
        toast('Image deleted');
      });
      wrap.appendChild(div);
    });
  }

  function initGalleryAdmin() {
    var drop    = $('#galleryDrop');
    var input   = $('#galleryInput');
    var pickBtn = $('#galleryPickBtn');
    if (!drop || !input) return;

    drop.addEventListener('click', function () { input.click(); });
    if (pickBtn) pickBtn.addEventListener('click', function () { input.click(); });

    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.add('drag');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove('drag');
      });
    });
    drop.addEventListener('drop', function (e) {
      handleFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', function () {
      handleFiles(this.files);
      this.value = '';
    });

    function handleFiles(files) {
      if (!files || !files.length) return;
      var arr = Array.prototype.slice.call(files).filter(function (f) {
        return /^image\//.test(f.type);
      });
      if (!arr.length) {
        toast('Please choose image files', 'error');
        return;
      }

      var processed = 0;
      arr.forEach(function (file) {
        compressImage(file, 900, 0.78, function (dataUrl) {
          data.gallery.push({
            id: uid('img'),
            src: dataUrl,
            caption: file.name.replace(/\.[^.]+$/, '').slice(0, 40)
          });
          processed++;
          if (processed === arr.length) {
            saveData();
            renderAdminGallery();
            renderGallery();
            toast(arr.length + ' photo(s) added');
          }
        });
      });
    }
  }

  /* ----------------------------------------------------------
     18. ADMIN - BRANDING (logo + hero)
     ---------------------------------------------------------- */
  function renderAdminBranding() {
    var logoImg  = $('#logoPreviewImg');
    var logoInit = $('#logoPreviewInitials');
    if (logoImg && logoInit) {
      if (data.logo) {
        logoImg.src = data.logo;
        logoImg.hidden = false;
        logoInit.style.display = 'none';
      } else {
        logoImg.removeAttribute('src');
        logoImg.hidden = true;
        logoInit.style.display = '';
      }
    }

    var heroPreview = $('#heroPreview');
    if (heroPreview) {
      if (data.heroImage) {
        heroPreview.style.backgroundImage = "url('" + data.heroImage + "')";
      } else {
        heroPreview.style.backgroundImage =
          "url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=70')";
      }
    }
  }

  /* Generic drag-and-drop helper */
  function setupDrop(opts) {
    var drop  = $(opts.drop);
    var input = $(opts.input);
    if (!drop || !input) return;

    drop.addEventListener('click', function () { input.click(); });
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.add('drag');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove('drag');
      });
    });
    drop.addEventListener('drop', function (e) {
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) readImageFile(file, opts.maxWidth || 1200, opts.onFile);
    });
    input.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (file) readImageFile(file, opts.maxWidth || 1200, opts.onFile);
      this.value = '';
    });
  }

  function initBrandingAdmin() {
    setupDrop({
      drop:     '#logoDrop',
      input:    '#logoInput',
      maxWidth: 400,
      onFile: function (dataUrl) {
        data.logo = dataUrl;
        saveData();
        renderAdminBranding();
        renderBusinessInfo();
        toast('Logo updated');
      }
    });

    setupDrop({
      drop:     '#heroDrop',
      input:    '#heroInput',
      maxWidth: 1920,
      onFile: function (dataUrl) {
        data.heroImage = dataUrl;
        saveData();
        renderAdminBranding();
        applyHeroImage();
        toast('Hero image updated');
      }
    });

    var logoRemove = $('#logoRemove');
    if (logoRemove) {
      logoRemove.addEventListener('click', function () {
        data.logo = '';
        saveData();
        renderAdminBranding();
        renderBusinessInfo();
        toast('Logo removed');
      });
    }

    var heroRemove = $('#heroRemove');
    if (heroRemove) {
      heroRemove.addEventListener('click', function () {
        data.heroImage = '';
        saveData();
        renderAdminBranding();
        applyHeroImage();
        toast('Hero image reset');
      });
    }
  }

  /* ----------------------------------------------------------
     19. ADMIN - BUSINESS INFO FORM
     ---------------------------------------------------------- */
  function fillBusinessForm() {
    var b = data.business;
    var map = {
      '#bizName':         b.name,
      '#bizTagline':      b.tagline,
      '#bizPhone':        b.phoneDisplay,
      '#bizWhatsapp':     b.whatsapp,
      '#bizEmail':        b.email,
      '#bizAddress':      b.address,
      '#bizHeroTitle':    b.heroTitle,
      '#bizHeroSubtitle': b.heroSubtitle,
      '#bizAbout':        b.about
    };
    Object.keys(map).forEach(function (sel) {
      var el = $(sel);
      if (el) el.value = map[sel] || '';
    });
  }

  function initBusinessForm() {
    var form = $('#businessForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = data.business;

      b.name         = $('#bizName').value.trim()         || b.name;
      b.shortName    = b.name.split(/\s+/).slice(0, 2).join(' ') || b.name;
      b.tagline      = $('#bizTagline').value.trim();
      b.phoneDisplay = $('#bizPhone').value.trim();
      b.phone        = b.phoneDisplay;
      b.whatsapp     = $('#bizWhatsapp').value.trim()     || b.whatsapp;
      b.email        = $('#bizEmail').value.trim()        || b.email;
      b.address      = $('#bizAddress').value.trim()      || b.address;
      b.heroTitle    = $('#bizHeroTitle').value.trim()    || b.heroTitle;
      b.heroSubtitle = $('#bizHeroSubtitle').value.trim() || b.heroSubtitle;
      b.about        = $('#bizAbout').value.trim()        || b.about;

      saveData();
      renderBusinessInfo();
      toast('Business info saved');
    });
  }

  /* ----------------------------------------------------------
     20. ADMIN - PASSWORD FORM
     ---------------------------------------------------------- */
  function initPasswordForm() {
    var form = $('#passwordForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var current = $('#pwCurrent').value;
      var next    = $('#pwNew').value;
      var confirm = $('#pwConfirm').value;
      var stored  = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;

      if (current !== stored) {
        toast('Current password is incorrect', 'error');
        return;
      }
      if (next.length < 4) {
        toast('New password must be at least 4 characters', 'error');
        return;
      }
      if (next !== confirm) {
        toast('New passwords do not match', 'error');
        return;
      }

      localStorage.setItem(PASSWORD_KEY, next);
      form.reset();
      toast('Password updated', 'success');
    });
  }

  /* ----------------------------------------------------------
     21. ADMIN - EXPORT / IMPORT / RESET
     ---------------------------------------------------------- */
  function initBackup() {
    var exportBtn = $('#exportBtn');
    var importBtn = $('#importBtn');
    var importIn  = $('#importInput');
    var resetBtn  = $('#resetBtn');

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        var stamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = 'sheba-town-backup-' + stamp + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 500);
        toast('Backup exported', 'success');
      });
    }

    if (importBtn && importIn) {
      importBtn.addEventListener('click', function () { importIn.click(); });
      importIn.addEventListener('change', function () {
        var file = this.files && this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var parsed = JSON.parse(e.target.result);
            if (!parsed || typeof parsed !== 'object') throw new Error('bad');
            data = {
              business: Object.assign({}, DEFAULT_DATA.business, parsed.business || {}),
              logo:      parsed.logo || '',
              heroImage: parsed.heroImage || '',
              services:  Array.isArray(parsed.services) ? parsed.services : deepClone(DEFAULT_DATA.services),
              gallery:   Array.isArray(parsed.gallery)  ? parsed.gallery  : deepClone(DEFAULT_DATA.gallery)
            };
            saveData(false);
            renderBusinessInfo();
            renderServices();
            renderGallery();
            renderAdminServices();
            renderAdminGallery();
            renderAdminBranding();
            fillBusinessForm();
            window.dispatchEvent(new Event('sheba:services-updated'));
            toast('Backup imported', 'success');
          } catch (err) {
            toast('That file is not a valid backup', 'error');
          }
        };
        reader.readAsText(file);
        this.value = '';
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!confirm('Reset everything to the original demo content? This cannot be undone.')) return;
        data = deepClone(DEFAULT_DATA);
        saveData(false);
        renderBusinessInfo();
        renderServices();
        renderGallery();
        renderAdminServices();
        renderAdminGallery();
        renderAdminBranding();
        fillBusinessForm();
        window.dispatchEvent(new Event('sheba:services-updated'));
        toast('Content reset to defaults');
      });
    }
  }

  /* ----------------------------------------------------------
     22. STORAGE BAR
     ---------------------------------------------------------- */
  function updateStorageBar() {
    var fill = $('#storageFill');
    var text = $('#storageText');
    if (!fill || !text) return;

    var bytes = 0;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      bytes = raw ? raw.length : 0;
    } catch (err) { bytes = 0; }

    /* localStorage limit is around 5 MB of UTF-16 chars */
    var MAX = 5 * 1024 * 1024;
    var pct = Math.min(100, Math.round((bytes / MAX) * 100));

    fill.style.width = pct + '%';

    var kb = (bytes / 1024).toFixed(1);
    var mb = (bytes / (1024 * 1024)).toFixed(2);
    text.textContent = bytes > 1024 * 1024
      ? 'Using ' + mb + ' MB of approximately 5 MB (' + pct + '%)'
      : 'Using ' + kb + ' KB of approximately 5 MB (' + pct + '%)';
  }

  /* ----------------------------------------------------------
     23. BOOT
     ---------------------------------------------------------- */
  function init() {
    loadData();
    renderBusinessInfo();
    renderServices();
    renderGallery();

    initNav();
    initReveal();
    initCounters();
    initContactForm();
    initAdmin();
    initServiceModal();
    initGalleryAdmin();
    initBrandingAdmin();
    initBusinessForm();
    initPasswordForm();
    initBackup();
    initLightboxControls();

    updateStorageBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();