/* ============================================================
   SolidReach Co. — site.js (Typewriter design)
   - SR helpers: typewriter, rotating words, money formatting
   - Package request popup (opened from each pricing card)
   - Page animations (GSAP + ScrollTrigger + Lenis smooth scroll)
   The pricing section itself is built by js/pricing.js, which
   calls SR.pricingReady() once the cards are on the page.
   ============================================================ */
(function () {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = !!(window.gsap && window.ScrollTrigger) && !RM;
  if (G) gsap.registerPlugin(ScrollTrigger);

  var CONTACT_EMAIL = 'info@solidreachco.com';

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- typewriter ---------- */
  function type(el, text, speed) {
    return new Promise(function (res) {
      if (RM) { el.textContent = text; return res(); }
      var i = 0; el.textContent = '';
      (function step() { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(step, speed || 55); else res(); })();
    });
  }
  function erase(el, speed) {
    return new Promise(function (res) {
      (function step() { var t = el.textContent; if (!t.length) return res(); el.textContent = t.slice(0, -1); setTimeout(step, speed || 30); })();
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function rotate(el, words, hold) {
    if (RM) { el.textContent = words[0]; return; }
    for (var i = 0; ; i = (i + 1) % words.length) { await type(el, words[i], 70); await wait(hold || 1600); await erase(el, 35); await wait(250); }
  }

  /* ---------- package request popup ---------- */
  var modal, mBody;
  function buildModal() {
    modal = h('div', 'fm'); modal.hidden = true;
    modal.innerHTML =
      '<div class="fm-bg" data-close></div>' +
      '<div class="fm-panel" data-lenis-prevent role="dialog" aria-modal="true" aria-labelledby="fm-title">' +
        '<div class="fm-head"><div><span class="fm-kicker"></span><h3 id="fm-title" class="fm-title"></h3></div>' +
        '<button type="button" class="fm-x" aria-label="Close" data-close>' +
        '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<div class="fm-body"></div></div>';
    document.body.appendChild(modal);
    mBody = modal.querySelector('.fm-body');
    modal.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeForm(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeForm(); });
  }
  function chips(label, items, multi) {
    var wrap = h('fieldset', 'fm-set');
    wrap.appendChild(h('legend', null, label));
    var row = h('div', 'fm-chips');
    items.forEach(function (it) {
      var b = h('button', 'fm-chip', it); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        if (!multi) row.querySelectorAll('.fm-chip').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', multi && on ? 'false' : 'true');
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    return wrap;
  }
  function field(id, label, type, ph, required) {
    var l = h('label', 'fm-field'); l.htmlFor = id;
    l.appendChild(h('span', null, label));
    var i = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') i.type = type; else i.rows = 3;
    i.id = id; i.name = id.replace('fm-', ''); i.placeholder = ph; i.required = !!required;
    l.appendChild(i);
    return l;
  }
  function picked(f, legend) {
    var out = [];
    f.querySelectorAll('.fm-set').forEach(function (set) {
      if (set.querySelector('legend').textContent !== legend) return;
      set.querySelectorAll('.fm-chip[aria-pressed="true"]').forEach(function (c) { out.push(c.textContent); });
    });
    return out;
  }

  /* plan: {title, priceValue, priceText}; cat: {group, needs, isAs} */
  function openForm(plan, cat) {
    if (!modal) buildModal();
    var priceLabel = plan.priceText ? plan.priceText + (plan.period || '/mo') : '';
    modal.querySelector('.fm-kicker').textContent = cat.group || cat.title || '';
    modal.querySelector('.fm-title').textContent = plan.title + (priceLabel ? ' · ' + priceLabel : '');
    mBody.innerHTML = '';
    var f = h('form', 'fm-form');
    var NEEDS = 'What do you need help with?', IND = 'Your industry';
    if (cat.needs && cat.needs.length) f.appendChild(chips(NEEDS, cat.needs, true));
    if (cat.industries && cat.industries.length) f.appendChild(chips(IND, cat.industries, false));
    var grid = h('div', 'fm-grid');
    grid.appendChild(field('fm-name', 'Full name', 'text', 'John Smith', true));
    grid.appendChild(field('fm-company', 'Company', 'text', 'Company name', false));
    grid.appendChild(field('fm-email', 'Email', 'email', 'john@company.com', true));
    grid.appendChild(field('fm-phone', 'Phone number', 'tel', '(555) 123-4567', true));
    f.appendChild(grid);
    f.appendChild(field('fm-notes', 'Anything else we should know?', 'textarea', 'Markets, goals, current tools…', false));
    var s = h('button', 'fm-submit', 'Submit Request'); s.type = 'submit';
    f.appendChild(s);
    /* honeypot: hidden from people, bots tend to fill it */
    var hp = h('div', 'fm-hp'); hp.setAttribute('aria-hidden', 'true');
    var hpi = document.createElement('input'); hpi.type = 'text'; hpi.name = 'website'; hpi.tabIndex = -1; hpi.autocomplete = 'off';
    hp.appendChild(hpi); f.appendChild(hp);
    var openedAt = Date.now();
    var DONE_ICON = '<svg aria-hidden="true" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6"/></svg>';
    var err = h('p', 'fm-err'); err.setAttribute('role', 'alert'); err.hidden = true;
    f.insertBefore(err, s);

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return (f.querySelector('#' + id).value || '').trim(); };
      var industry = cat.industries && cat.industries.length ? (picked(f, IND)[0] || '') : '';
      var payload = {
        package: plan.title, price: priceLabel, solution: cat.group || cat.title || '',
        needs: picked(f, NEEDS), industry: industry,
        name: v('fm-name'), company: v('fm-company'), email: v('fm-email'), phone: v('fm-phone'), notes: v('fm-notes'),
        website: hpi.value, elapsed: Date.now() - openedAt
      };
      function mailtoHref() {
        var lines = ['Package: ' + payload.package + (priceLabel ? ' (' + priceLabel + ')' : ''), 'Solution: ' + payload.solution, 'Needs: ' + (payload.needs.join(', ') || '-')];
        if (industry) lines.push('Industry: ' + industry);
        lines.push('', 'Name: ' + payload.name, 'Company: ' + (payload.company || '-'), 'Email: ' + payload.email, 'Phone: ' + payload.phone, '', 'Notes: ' + (payload.notes || '-'));
        return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Package request: ' + payload.package + ' — ' + payload.name) + '&body=' + encodeURIComponent(lines.join('\n'));
      }
      function done(title, text, withMail) {
        mBody.innerHTML = '<div class="fm-done">' + DONE_ICON + '<h4></h4><p></p></div>';
        mBody.querySelector('h4').textContent = title; mBody.querySelector('.fm-done p').textContent = text;
        if (withMail) {
          var p = h('p', 'fm-mock'); p.appendChild(document.createTextNode('No email app? Write to us at '));
          var a = h('a', null, CONTACT_EMAIL); a.href = 'mailto:' + CONTACT_EMAIL; p.appendChild(a);
          mBody.querySelector('.fm-done').appendChild(p);
        }
      }
      function fallbackToEmail() {
        window.location.href = mailtoHref();
        done('Almost done', 'Your email app opened with your request ready. Press send and our team will call you at the number you provided.', true);
      }
      function showErr(msg) { err.textContent = msg; err.hidden = false; s.disabled = false; s.textContent = 'Submit Request'; }

      err.hidden = true; s.disabled = true; s.textContent = 'Sending…';
      fetch('api/lead.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
        .then(function (res) {
          if (res.j.ok) return done('Request received', 'Thanks! Our team will call you at the number you provided.', false);
          if (res.status === 422) {
            var names = { email: 'email', phone: 'phone number', name: 'full name' };
            var fields = (res.j.fields || []).map(function (k) { return names[k] || k; });
            return showErr('Please check your ' + (fields.join(', ') || 'details') + ' and try again.');
          }
          if (res.status === 429) return showErr('We already received several requests from you. Please try again later or email ' + CONTACT_EMAIL + '.');
          fallbackToEmail(); /* endpoint not set up or mail server down */
        })
        .catch(fallbackToEmail);
    });
    mBody.appendChild(f);
    modal.hidden = false;
    document.documentElement.classList.add('fm-open');
    if (lenis) lenis.stop();
    if (G) {
      gsap.fromTo(modal.querySelector('.fm-bg'), { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modal.querySelector('.fm-panel'), { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
      gsap.from(f.children, { y: 16, opacity: 0, stagger: 0.05, duration: 0.4, delay: 0.15, ease: 'power2.out' });
    }
    setTimeout(function () { var x = modal.querySelector('.fm-chip, input'); if (x) x.focus(); }, 60);
  }
  function closeForm() { modal.hidden = true; document.documentElement.classList.remove('fm-open'); if (lenis) lenis.start(); }

  /* ---------- smooth scrolling + in-page links ---------- */
  var navEl = document.querySelector('.nav');
  function setNavH() { if (navEl) document.documentElement.style.setProperty('--navh', navEl.offsetHeight + 'px'); }
  setNavH(); window.addEventListener('resize', setNavH);

  var lenis = null;
  if (G && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function goTo(el) { if (lenis) lenis.scrollTo(el, { offset: -88 }); else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var t = document.getElementById(id.slice(1)); if (!t) return;
    e.preventDefault(); goTo(t);
  });

  window.SR = { RM: RM, G: G, money: money, h: h, type: type, erase: erase, wait: wait, rotate: rotate,
    openForm: openForm, goTo: goTo,
    pricingReady: function () { if (G) ScrollTrigger.refresh(); } };

  /* ---------- typewriter headline, then rotating industries ---------- */
  (async function () {
    var t1 = document.getElementById('t1'), t2 = document.getElementById('t2');
    if (!t1 || !t2) return;
    if (!RM) {
      var a = t1.textContent, b = t2.textContent; t1.textContent = ''; t2.textContent = '';
      await type(t1, a, 48); await wait(180); await type(t2, b, 48);
    }
    rotate(document.getElementById('rot'), ['Real Estate', 'Roofing', 'Solar', 'Insurance'], 1500);
  })();

  if (!G) return;

  /* hero image stack */
  gsap.from('.stack img', { y: 80, rotate: function (i) { return [-8, 7, -4][i]; }, opacity: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 });
  gsap.to('.s1', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.s2', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.s3', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.from(['.rot', '.lead', '.hero .ctas'], { y: 20, opacity: 0, stagger: 0.12, duration: 0.8, delay: 2.6, ease: 'power2.out' });

  /* reading progress bar */
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ticker: always moving; scroll speed pushes it and leans the words */
  var loop = gsap.to('#ticker', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
  var skew = gsap.quickTo('#ticker span', 'skewX', { duration: 0.4, ease: 'power3' });
  var skT;
  ScrollTrigger.create({ onUpdate: function (s) {
    var v = s.getVelocity();
    gsap.to(loop, { timeScale: s.direction * Math.min(5, 1 + Math.abs(v) / 400), duration: 0.25, overwrite: true });
    gsap.to(loop, { timeScale: s.direction, duration: 1, delay: 0.25 });
    skew(gsap.utils.clamp(-14, 14, -v / 120));
    clearTimeout(skT); skT = setTimeout(function () { skew(0); }, 120);
  } });

  /* magnetic buttons */
  if (window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.btn').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
      b.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  /* eyebrow labels decode when they appear */
  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+';
  document.querySelectorAll('.eyebrow').forEach(function (el) {
    var final = el.textContent;
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      var o = { p: 0 };
      gsap.to(o, { p: 1, duration: 0.9, ease: 'none', onUpdate: function () {
        var n = Math.floor(o.p * final.length);
        el.textContent = final.slice(0, n) + final.slice(n).replace(/[^ ]/g, function () { return CH[(Math.random() * CH.length) | 0]; });
      }, onComplete: function () { el.textContent = final; } });
    } });
  });

  /* about: photo opens from the centre and drifts, copy steps in, headline types */
  gsap.from('.about-photo', { clipPath: 'inset(16% 16% 16% 16% round 26px)', duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: '.about-top', start: 'top 75%' } });
  gsap.to('.about-photo img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.about-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.about-tag', { x: 40, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.about-top', start: 'top 60%' } });
  gsap.from('.about-copy > *:not(h2):not(.eyebrow)', { y: 26, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.about-copy', start: 'top 78%' } });
  var ah = document.getElementById('aboutH'), ahText = ah.textContent;
  ah.setAttribute('aria-label', ahText);
  ScrollTrigger.create({ trigger: ah, start: 'top 85%', once: true, onEnter: function () { type(ah, ahText, 38); } });

  /* about: the line fills as you scroll and each step lights up when it is reached */
  var steps = document.querySelectorAll('.flow li');
  gsap.from('.beyond-head > *', { y: 24, opacity: 0, stagger: 0.1, duration: 0.7, scrollTrigger: { trigger: '.beyond', start: 'top 80%' } });
  gsap.from(steps, { y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.flow', start: 'top 85%' } });
  gsap.to('.track-fill', { scaleX: 1, scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.flow-wrap', start: 'top 70%', end: 'bottom 45%', scrub: true,
      onUpdate: function (s) { steps.forEach(function (li, i) { li.classList.toggle('on', s.progress >= (i / (steps.length - 1)) * 0.98); }); } } });

  /* services: sticky frame swaps images as steps pass */
  var imgs = document.querySelectorAll('.frame img'), tag = document.getElementById('frameTag');
  var tags = ['Real Estate', 'Appointment Setting', 'Roofing · Solar · Insurance'];
  document.querySelectorAll('.step').forEach(function (st) {
    ScrollTrigger.create({ trigger: st, start: 'top 60%', end: 'bottom 40%', toggleClass: 'on',
      onToggle: function (self) { if (!self.isActive) return; var i = +st.dataset.img;
        imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); }); tag.textContent = tags[i]; } });
  });

  /* CTA types itself when reached */
  var ct = document.getElementById('ctaType'), ctText = ct.textContent;
  ScrollTrigger.create({ trigger: ct, start: 'top 85%', once: true, onEnter: function () { type(ct, ctText, 45); } });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
