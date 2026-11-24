/* Les Lumières — maquette de commande en ligne (front uniquement). */
(() => {
  'use strict';
  const D = window.LL_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const eur = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IMG = id => `assets/img/plats/${id}.webp`;
  const FALLBACK = 'assets/img/logo-blanc.png';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('ll_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('ll_' + k, JSON.stringify(v)); } catch {} }
  };

  // Index produits
  const PRODUCTS = {};
  D.cats.forEach(c => c.sections.forEach(s => s.items.forEach(p => {
    PRODUCTS[p.id] = { ...p, cat: c, sec: s };
  })));

  /* ---------------- Loader ---------------- */
  const loader = $('#loader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  const hideLoader = () => {
    const wait = Math.max(0, (reduce ? 200 : 2300) - (performance.now() - t0));
    setTimeout(() => { loader.classList.add('is-done'); document.body.classList.remove('locked'); }, wait);
  };
  document.body.classList.add('locked');
  if (document.readyState === 'complete') hideLoader(); else addEventListener('load', hideLoader);
  setTimeout(hideLoader, 4000);
  loader.addEventListener('click', () => { loader.classList.add('is-done'); document.body.classList.remove('locked'); });

  /* ---------------- En-tête ---------------- */
  const top = $('#top');
  addEventListener('scroll', () => top.classList.toggle('is-scrolled', scrollY > 8), { passive: true });

  /* ---------------- Mode de commande ---------------- */
  let mode = store.get('mode', 'emporter');
  const MODE_LABEL = { emporter: 'À emporter', surplace: 'Sur place' };
  function setMode(m) {
    mode = m; store.set('mode', m);
    $$('.mode').forEach(g => {
      g.dataset.mode = m;
      $$('.mode__opt', g).forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === m)));
    });
  }
  $$('.mode').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('.mode__opt'); if (!b) return;
    setMode(b.dataset.mode);
    if (g.id === 'modeHero') toast(MODE_LABEL[mode] + ' sélectionné');
  }));
  setMode(mode);

  /* ---------------- Univers + menu ---------------- */
  const count = c => c.sections.reduce((n, s) => n + s.items.length, 0);
  $('#universGrid').innerHTML = D.cats.map(c => `
    <a class="utile" href="#cat-${c.id}">
      <img src="assets/img/categories/${c.img}.webp" alt="" loading="lazy" width="300" height="190">
      <span>${esc(c.name)}</span><small>${count(c)} choix</small>
    </a>`).join('');

  $('#railIn').innerHTML = D.cats.map(c => `<a href="#cat-${c.id}" data-cat="${c.id}">${esc(c.name)}</a>`).join('');

  const card = p => {
    const hasOpts = p.o && p.o.length;
    const custom = hasOpts && p.o.some(k => D.groups[k].req) ? 'À composer' : hasOpts ? 'Personnalisable' : '';
    return `<button class="card" type="button" data-id="${p.id}" aria-label="${esc(p.n)}, ${eur(p.p)}">
      <div class="card__img"><img src="${IMG(p.id)}" alt="" loading="lazy" width="400" height="400" onerror="this.onerror=null;this.src='${FALLBACK}';this.style.opacity=.25"></div>
      <div class="card__body">
        <h3 class="card__name">${esc(p.n)}</h3>
        ${p.d ? `<p class="card__desc">${esc(p.d)}</p>` : ''}
        <div class="card__row">
          <div><div class="card__price">${eur(p.p)}</div>${custom ? `<div class="card__badge">${custom}</div>` : ''}</div>
          <span class="card__add" aria-hidden="true">+</span>
        </div>
      </div>
    </button>`;
  };
  $('#menuRoot').innerHTML = D.cats.map(c => `
    <section class="cat" id="cat-${c.id}" aria-labelledby="h-${c.id}">
      <header class="cat__head">
        <h2 id="h-${c.id}">${esc(c.name)}</h2>
        ${c.tag ? `<span class="cat__tag">${esc(c.tag)}</span>` : ''}
        <span class="cat__count">${count(c)} ${count(c) > 1 ? 'articles' : 'article'}</span>
      </header>
      ${c.sections.map(s => `${s.t ? `<h3 class="sub">${esc(s.t)}</h3>` : ''}<div class="grid">${s.items.map(card).join('')}</div>`).join('')}
    </section>`).join('');

  // Scrollspy du rail
  const railLinks = $$('#railIn a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = en.target.id.replace('cat-', '');
      railLinks.forEach(a => {
        const on = a.dataset.cat === id;
        a.classList.toggle('is-active', on);
        if (on) a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('.cat').forEach(s => spy.observe(s));

  $('#menuRoot').addEventListener('click', e => {
    const c = e.target.closest('.card'); if (c) openProduct(c.dataset.id);
  });

  /* ---------------- Overlays ---------------- */
  let lastFocus = null;
  function openOv(el) {
    lastFocus = document.activeElement;
    el.hidden = false; document.body.classList.add('locked');
    const f = $('[data-close]', el); setTimeout(() => f && f.focus({ preventScroll: true }), 30);
  }
  function closeOv(el) {
    el.hidden = true;
    if (!$$('.overlay').some(o => !o.hidden)) document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $$('.overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) closeOv(o); });
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = $$('.overlay').filter(o => !o.hidden).pop(); if (open) closeOv(open);
  });

  /* ---------------- Fiche produit ---------------- */
  const pOv = $('#productOverlay');
  let cur = null, qty = 1;

  function openProduct(id) {
    const p = PRODUCTS[id]; if (!p) return;
    cur = p; qty = 1;
    $('#pImg').src = IMG(p.id); $('#pImg').onerror = function () { this.onerror = null; this.src = FALLBACK; };
    $('#pCat').textContent = p.cat.name + (p.sec.t ? ' · ' + p.sec.t : '');
    $('#pTitle').textContent = p.n;
    $('#pDesc').textContent = p.d ? 'Composition : ' + p.d + '.' : '';
    $('#pPrice').textContent = eur(p.p);
    $('#pNote').value = '';
    $('#pGroups').innerHTML = (p.o || []).map((k, gi) => groupHTML(D.groups[k], gi)).join('');
    syncCond(); refreshProduct();
    openOv(pOv);
    $('.sheet', pOv).scrollTop = 0;
  }

  function groupHTML(g, gi) {
    const rm = g.k === 'remove';
    const type = g.k === 'single' ? 'radio' : 'checkbox';
    const hint = g.req ? 'Obligatoire' : rm ? 'Sans supplément' : g.h || 'Facultatif';
    return `<fieldset class="grp${g.hid ? ' grp--cond' : ''}" data-gi="${gi}" ${g.c ? `data-champ="${g.c}"` : ''} ${g.hid ? 'hidden' : ''} ${g.req ? 'data-req="1"' : ''}>
      <div class="grp__head"><legend class="grp__t">${esc(g.t)}</legend><span class="grp__h${g.req ? ' req' : ''}">${esc(hint)}</span></div>
      <div class="opts">${g.o.map((o, oi) => `
        <label class="o${rm ? ' o--rm' : ''}">
          <input type="${type}" name="g${gi}" value="${oi}" data-p="${o.p}" ${o.show ? `data-show="${o.show.join(';')}"` : ''}>
          <span>${rm ? 'Sans ' : ''}${esc(o.n.toLowerCase())}${o.p ? ` <em>+${eur(o.p)}</em>` : ''}</span>
        </label>`).join('')}</div>
    </fieldset>`;
  }

  // Groupes conditionnels (ex. sauce frites visible seulement si des frites sont choisies)
  function syncCond() {
    const show = new Set();
    $$('#pGroups input:checked').forEach(i => (i.dataset.show || '').split(';').filter(Boolean).forEach(s => show.add(s)));
    $$('#pGroups .grp--cond').forEach(g => {
      const on = show.has(g.dataset.champ);
      if (!on) $$('input', g).forEach(i => { i.checked = false; });
      g.hidden = !on;
    });
  }

  function selection() {
    const out = [];
    $$('#pGroups .grp:not([hidden])').forEach(f => {
      const g = D.groups[cur.o[+f.dataset.gi]];
      $$('input:checked', f).forEach(i => {
        const o = g.o[+i.value];
        out.push({ g: g.t, n: o.n, p: o.p, rm: g.k === 'remove' });
      });
    });
    return out;
  }
  function unitPrice() { return cur.p + selection().reduce((s, o) => s + o.p, 0); }
  function refreshProduct() {
    $('#qVal').textContent = qty;
    $('#pTotal').textContent = eur(unitPrice() * qty);
    $$('#pGroups .grp[data-req]').forEach(f => {
      const done = !!$('input:checked', f);
      const h = $('.grp__h', f);
      h.textContent = done ? 'Choisi ✓' : 'Obligatoire';
      h.className = 'grp__h ' + (done ? 'ok' : 'req');
      if (done) f.classList.remove('is-missing');
    });
  }
  $('#pGroups').addEventListener('change', () => { syncCond(); refreshProduct(); });
  $('#qMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); refreshProduct(); });
  $('#qPlus').addEventListener('click', () => { qty = Math.min(50, qty + 1); refreshProduct(); });
  $('#pAdd').addEventListener('click', () => {
    const missing = $$('#pGroups .grp[data-req]:not([hidden])').filter(f => !$('input:checked', f));
    if (missing.length) {
      missing.forEach(f => { f.classList.remove('is-missing'); void f.offsetWidth; f.classList.add('is-missing'); });
      missing[0].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      toast('Choisissez : ' + missing.map(f => D.groups[cur.o[+f.dataset.gi]].t.toLowerCase()).join(', '));
      return;
    }
    addToCart(cur, selection(), $('#pNote').value.trim(), qty);
    closeOv(pOv);
    toast(`${qty} × ${cur.n.toLowerCase()} ajouté au panier`);
  });

  /* ---------------- Panier ---------------- */
  let cart = store.get('cart', []);
  function addToCart(p, opts, note, q) {
    const key = p.id + '|' + JSON.stringify(opts.map(o => o.n)) + '|' + note;
    const unit = p.p + opts.reduce((s, o) => s + o.p, 0);
    const ex = cart.find(l => l.key === key);
    if (ex) ex.qty += q; else cart.push({ key, id: p.id, n: p.n, sec: p.sec.t, opts, note, unit, qty: q });
    saveCart(); const b = $('#btnCart'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  const cartTotal = () => cart.reduce((s, l) => s + l.unit * l.qty, 0);
  const cartQty = () => cart.reduce((s, l) => s + l.qty, 0);
  function saveCart() { store.set('cart', cart); renderCart(); }
  function renderCart() {
    const n = cartQty(), tot = eur(cartTotal());
    $('#cartCount').textContent = n; $('#cartTotalTop').textContent = tot;
    $('#btnCart').classList.toggle('has-items', n > 0);
    $('#cartBar').hidden = n === 0; $('#cartBarCount').textContent = n; $('#cartBarTotal').textContent = tot;
    $('#cartTotal').textContent = tot; $('#btnCheckout').disabled = n === 0;
    $('#btnCheckout').style.opacity = n ? 1 : .4;
    $('#cartList').innerHTML = n ? cart.map((l, i) => `
      <div class="line">
        <div class="line__img"><img src="${IMG(l.id)}" alt="" onerror="this.onerror=null;this.src='${FALLBACK}'"></div>
        <div style="min-width:0">
          <p class="line__n">${esc(l.n)}${l.sec ? ` <span class="mono" style="color:var(--muted);font-weight:400">· ${esc(l.sec)}</span>` : ''}</p>
          ${l.opts.length || l.note ? `<p class="line__o">${l.opts.map(o => o.rm ? `<span class="rm">sans ${esc(o.n.toLowerCase())}</span>` : esc(o.n.toLowerCase()) + (o.p ? ` (+${eur(o.p)})` : '')).join(' · ')}${l.note ? `${l.opts.length ? ' · ' : ''}« ${esc(l.note)} »` : ''}</p>` : ''}
        </div>
        <div class="line__r">
          <span class="line__p">${eur(l.unit * l.qty)}</span>
          <div class="qty neu-in"><button type="button" data-dec="${i}" aria-label="Retirer un">${l.qty === 1 ? '×' : '−'}</button><output>${l.qty}</output><button type="button" data-inc="${i}" aria-label="Ajouter un">+</button></div>
        </div>
      </div>`).join('') : `<div class="empty"><div class="bulb"><i></i></div><p>Votre panier est vide.<br>La carte vous attend.</p><button class="btn btn--ghost" type="button" data-close>Voir la carte</button></div>`;
    $$('.card__qty').forEach(e => e.remove());
    const per = {}; cart.forEach(l => { per[l.id] = (per[l.id] || 0) + l.qty; });
    Object.entries(per).forEach(([id, q]) => $$(`.card[data-id="${id}"]`).forEach(c => c.insertAdjacentHTML('beforeend', `<span class="card__qty">${q}</span>`)));
  }
  $('#cartList').addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) cart[+inc.dataset.inc].qty++;
    else if (dec) { const l = cart[+dec.dataset.dec]; if (--l.qty <= 0) cart.splice(+dec.dataset.dec, 1); }
    else return;
    saveCart();
  });
  const cOv = $('#cartOverlay');
  $('#btnCart').addEventListener('click', () => openOv(cOv));
  $('#cartBar').addEventListener('click', () => openOv(cOv));
  renderCart();

  /* ---------------- Validation ---------------- */
  const coOv = $('#checkoutOverlay');
  function fillTimes() {
    const sel = $('#coTime'); const d = new Date(Date.now() + 25 * 60000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    let h = '';
    for (let i = 0; i < 14; i++) { const t = new Date(d.getTime() + i * 15 * 60000); const s = t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); h += `<option>${s}</option>`; }
    sel.innerHTML = h;
  }
  $('#btnCheckout').addEventListener('click', () => {
    if (!cart.length) return;
    closeOv(cOv); fillTimes();
    $('#coForm').hidden = false; $('#coDone').hidden = true; $('#coErr').textContent = '';
    const prof = store.get('profile', null);
    if (prof) ['coNom', 'coPrenom', 'coTel', 'coMail'].forEach(k => { if (!$('#' + k).value) $('#' + k).value = prof[k] || ''; });
    $('#coRecap').innerHTML = cart.map(l => `<div><span>${l.qty} × ${esc(l.n.toLowerCase())}</span><span>${eur(l.unit * l.qty)}</span></div>`).join('') + `<div style="border-top:1px solid var(--line);padding-top:8px;font-weight:800"><span>Total</span><span>${eur(cartTotal())}</span></div>`;
    $('#coTotal').textContent = eur(cartTotal());
    openOv(coOv);
  });
  $('#coWhen').addEventListener('change', e => { $('#coTimeWrap').hidden = e.target.value !== 'later'; });
  $('#coLogin').addEventListener('click', () => openAccount('login'));
  $('#coForm').addEventListener('submit', e => {
    e.preventDefault();
    const req = ['coNom', 'coPrenom', 'coTel', 'coMail'];
    let bad = [];
    req.forEach(k => { const i = $('#' + k); const ok = i.value.trim() && i.checkValidity() && (k !== 'coTel' || i.value.replace(/\D/g, '').length >= 10); i.setAttribute('aria-invalid', String(!ok)); if (!ok) bad.push(i); });
    if (bad.length) { $('#coErr').textContent = 'Merci de compléter : ' + bad.map(i => i.parentElement.firstChild.textContent.trim().toLowerCase()).join(', ') + '.'; bad[0].focus(); return; }
    store.set('profile', Object.fromEntries(req.map(k => [k, $('#' + k).value.trim()])));
    const when = $('input[name="when"]:checked').value === 'asap' ? 'dès que possible' : 'pour ' + $('#coTime').value;
    const pay = $('input[name="pay"]:checked').value;
    $('#coNum').textContent = 'LL-' + String(Math.floor(1000 + Math.random() * 9000));
    $('#coDoneMode').textContent = MODE_LABEL[mode];
    $('#coDoneTxt').textContent = `${$('#coPrenom').value.trim()}, votre commande de ${eur(cartTotal())} est prévue ${when}. Paiement : ${pay.toLowerCase()}${mode === 'emporter' ? ', au retrait' : ', au comptoir'}.`;
    $('#coForm').hidden = true; $('#coDone').hidden = false;
    cart = []; saveCart();
  });

  /* ---------------- Compte ---------------- */
  const aOv = $('#accountOverlay');
  function openAccount(tab) { setTab(tab); openOv(aOv); }
  function setTab(t) {
    $$('.tabs [data-tab]', aOv).forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    $$('[data-panel]', aOv).forEach(p => { p.hidden = p.dataset.panel !== t; });
  }
  $('.tabs', aOv).addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
  $('#btnAccount').addEventListener('click', () => openAccount('login'));
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const ok = $('#lgId').value.trim() && $('#lgPw').value;
    $('#lgMsg').textContent = ok ? 'Connexion simulée : dans la version finale, vos coordonnées seront préremplies.' : 'Saisissez votre identifiant et votre mot de passe.';
    if (ok) { toast('Bienvenue !'); setTimeout(() => closeOv(aOv), 900); }
  });
  $('#signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target; const missing = $$('[required]', f).filter(i => !i.value.trim() || !i.checkValidity());
    $$('[required]', f).forEach(i => i.setAttribute('aria-invalid', String(missing.includes(i))));
    if (missing.length) { $('#suMsg').textContent = 'Complétez les champs en rouge.'; return; }
    if ($('#suPw').value !== $('#suPw2').value) { $('#suMsg').textContent = 'Les deux mots de passe ne correspondent pas.'; $('#suPw2').setAttribute('aria-invalid', 'true'); return; }
    store.set('profile', { coNom: $('#suNom').value.trim().toUpperCase(), coPrenom: $('#suPrenom').value.trim(), coTel: $('#suTel').value.trim(), coMail: $('#suMail').value.trim() });
    $('#suMsg').textContent = 'Compte créé (simulation).'; toast('Compte créé'); setTimeout(() => closeOv(aOv), 900);
  });

  /* ---------------- Divers ---------------- */
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2400); }
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.copy;
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Numéro copié'), () => toast(v));
  }));

  // Lumière qui suit le curseur dans le hero (desktop)
  const hero = $('.hero__visual');
  if (hero && matchMedia('(pointer:fine)').matches && !reduce) {
    addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
      hero.style.transform = `translate3d(${x * -14}px, ${y * -10}px, 0)`;
    }, { passive: true });
  }
})();
