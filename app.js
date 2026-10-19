/* LANDERO111 site — shared behaviour */
(function () {
  var CODE = 'LANDERO111';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var money = function (n, d) { return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  window.LDR = { money: money };

  /* toast + copy */
  var toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);
  var tT = 0;
  function toast(t) { toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove('show'); }, 2200); }
  window.LDR.toast = toast;
  function copy(text, msg) {
    var done = function () { toast(msg || 'Copied'); };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    function fallback() { var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Code: ' + text); } t.remove(); }
  }
  window.LDR.copy = copy;
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', function () { copy(b.getAttribute('data-copy') || CODE, 'Code ' + CODE + ' copied'); }); });

  /* nav: active page + mobile menu */
  var page = document.body.getAttribute('data-page');
  $$('.nav a, .mnav a.ml').forEach(function (a) { if (a.getAttribute('data-p') === page) a.classList.add('on'); });
  var hdr = $('.hdr'), mb = $('#menuBtn');
  if (mb) {
    mb.addEventListener('click', function () { var o = !hdr.classList.contains('open'); hdr.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') { hdr.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });
  }

  /* scroll beam + back to top */
  var beam = $('#beam'), top = $('#toTop'), ring = $('#toTopRing'), C = 2 * Math.PI * 24, tick = false;
  if (ring) ring.style.strokeDasharray = C.toFixed(1);
  function onScroll() {
    tick = false;
    var h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
    if (beam) { beam.style.setProperty('--p', (p * 100).toFixed(2) + '%'); beam.style.setProperty('--o', p > .005 ? 1 : 0); }
    if (ring) ring.style.setProperty('--off', (C * (1 - p)).toFixed(1));
    if (top) top.classList.toggle('show', scrollY > innerHeight * .8);
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();
  if (top) top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* every card animates in, staggered across its row */
  $$('.card, .tier').forEach(function (el) { if (!el.classList.contains('rv') && !el.closest('.rv')) el.classList.add('rv'); });
  $$('.offers, .steps, .split, .ladder, .podium').forEach(function (g) { $$(':scope > .rv', g).forEach(function (el, i) { el.classList.add('s' + Math.min(4, i % 5)); }); });

  /* 3D tilt + light glare on cards (desktop pointer only) */
  if (fine && !reduce) $$('.card, .pod, .tier').forEach(function (el) {
    if (el.querySelector('input, select, textarea, iframe') || el.classList.contains('lbt') || el.classList.contains('ranks')) return;
    el.classList.add('mv'); var g = document.createElement('span'); g.className = 'glare'; g.setAttribute('aria-hidden', 'true'); el.appendChild(g);
    var max = el.classList.contains('banner') || el.offsetWidth > 700 ? 3 : 7;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.classList.add('hov');
      el.style.transform = 'perspective(1000px) rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg) translateY(-4px)';
      el.style.setProperty('--gx', (e.clientX - r.left) + 'px'); el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('hov'); el.style.transform = ''; });
  });

  /* reveal on scroll (content visible by default) */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { if (e.boundingClientRect.top > innerHeight * .1) e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  }

  /* cursor glow + card border glow */
  var cg = $('.bg .cur');
  if (fine && !reduce && cg) addEventListener('pointermove', function (e) { cg.style.setProperty('--cx', e.clientX + 'px'); cg.style.setProperty('--cy', e.clientY + 'px'); }, { passive: true });
  if (fine) $$('.gc').forEach(function (el) { el.addEventListener('pointermove', function (ev) { var r = el.getBoundingClientRect(); el.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); el.style.setProperty('--my', (ev.clientY - r.top) + 'px'); }); });

  /* count-up numbers */
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
        if (reduce) { el.textContent = pre + to.toLocaleString('en-US') + suf; return; }
        var t0 = null; (function s(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = pre + v.toLocaleString('en-US') + suf; if (k < 1) requestAnimationFrame(s); })(performance.now());
      });
    }, { threshold: .4 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* countdowns: month end (leaderboard) and weekend window (VIP weekly) — UTC */
  function pad(n) { return String(n).padStart(2, '0'); }
  function monthEnd(now) { return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)); }
  function weekend(now) {
    var d = now.getUTCDay(), base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (d === 6 || d === 0) { var end = base + ((d === 6 ? 2 : 1) * 864e5); return { live: true, t: new Date(end) }; }
    return { live: false, t: new Date(base + ((6 - d) * 864e5)) };
  }
  window.LDR.weekend = weekend;
  function paintCd(el, target) {
    var s = Math.max(0, Math.floor((target - new Date()) / 1000)), d = Math.floor(s / 86400); s %= 86400;
    var parts = [d, Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60];
    $$('b', el).forEach(function (b, i) { b.textContent = pad(parts[i]); });
  }
  function tickCd() {
    var now = new Date();
    $$('[data-cd="month"]').forEach(function (el) { paintCd(el, monthEnd(now)); });
    var w = weekend(now);
    $$('[data-cd="weekend"]').forEach(function (el) { paintCd(el, w.t); });
    $$('[data-weekend-status]').forEach(function (el) {
      el.classList.toggle('live', w.live);
      var v = $('.val', el), l = $('.lab', el);
      if (v) v.textContent = w.live ? 'Claims open now' : 'Locked Mon–Fri';
      if (l) l.textContent = w.live ? 'Closes in' : 'Unlocks in';
    });
  }
  tickCd(); setInterval(tickCd, 1000);

  /* leaderboard (preview data until the Stake API is wired) */
  var PRIZES = [2000, 1250, 750, 450, 250, 150, 75, 35, 20, 20];
  var SAMPLE = [['Z*******D1', 6416.61], ['G********N2', 682.18], ['A****11', 458.42], ['k****ly', 210.37], ['S**********w9', 82.25], ['d*x6', 50.91], ['d*****aw', 35.74], ['P******k2', 32.92], ['l*********23', 0.20], ['M**fx', 0.16]];
  var COLORS = ['#2f6bff', '#6b4dff', '#1fa2ff', '#ff6b7d', '#3ee08f', '#f5c451', '#4fd8ff', '#b05cff', '#ff9a52', '#5b8cff'];
  window.LDR.prizes = PRIZES;
  function ini(n) { var c = n.replace(/[^A-Za-z0-9]/g, ''); return (c[0] + (c[c.length - 1] || '')).toUpperCase(); }
  var players = SAMPLE.map(function (p, i) { return { n: p[0], w: p[1], c: COLORS[i] }; });
  function renderPodium() {
    $$('[data-podium]').forEach(function (box) {
      [1, 0, 2].forEach(function (i, k) {
        var p = players[i], el = box.children[k]; if (!el || !p) return;
        $('.av span', el).textContent = ini(p.n); $('.nm', el).textContent = p.n;
        $('.wg b', el).textContent = money(p.w, 2); $('.pz', el).textContent = money(PRIZES[i]);
      });
    });
  }
  function renderTable() {
    $$('[data-lbtable]').forEach(function (t) {
      var rows = parseInt(t.getAttribute('data-rows') || '15', 10), from = parseInt(t.getAttribute('data-from') || '4', 10), html = '';
      for (var r = from; r <= rows; r++) {
        var p = players[r - 1];
        if (p) html += '<div class="tr" data-n="' + r + '"><span class="r">#' + r + '</span><span class="u"><i style="--c:' + p.c + '">' + ini(p.n) + '</i><span>' + p.n + '</span></span><span class="w num">' + money(p.w, 2) + '</span><span class="p">' + (PRIZES[r - 1] ? money(PRIZES[r - 1]) : '–') + '</span></div>';
        else html += '<div class="tr hid"><span class="r">#' + r + '</span><span class="u"><i>–</i><span>Open spot</span></span><span class="w num">$0.00</span><span class="p">' + (PRIZES[r - 1] ? money(PRIZES[r - 1]) : '–') + '</span></div>';
      }
      $('.body', t).innerHTML = html;
    });
  }
  if ($('[data-podium]') || $('[data-lbtable]')) {
    renderPodium(); renderTable();
    if (!reduce) setInterval(function () {
      if (document.hidden) return;
      var i = 3 + Math.floor(Math.random() * 7), p = players[i]; p.w = Math.round((p.w + 2 + Math.random() * 30) * 100) / 100;
      if (Math.random() < .2) { var j = Math.floor(Math.random() * 3); players[j].w = Math.round((players[j].w + 5 + Math.random() * 60) * 100) / 100; }
      players.sort(function (a, b) { return b.w - a.w; });
      renderPodium(); renderTable();
      var row = $('[data-lbtable] .tr[data-n="' + (players.indexOf(p) + 1) + '"]'); if (row) { row.classList.add('up'); setTimeout(function () { row.classList.remove('up'); }, 1100); }
    }, 3200);
  }

  /* kick player: load on click (saves data until someone wants it) */
  $$('.player .ph').forEach(function (ph) {
    function go() { var f = document.createElement('iframe'); f.src = 'https://player.kick.com/landero111?autoplay=true'; f.allow = 'autoplay; fullscreen'; f.allowFullscreen = true; f.title = 'Landero live on Kick'; ph.parentNode.appendChild(f); ph.remove(); }
    ph.addEventListener('click', go); ph.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* hero sparks */
  var cv = $('#sparks');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, P = [], run = true, small = matchMedia('(max-width:700px)').matches;
    var size = function () { var r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    var mk = function (init) { return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, r: .6 + Math.random() * 1.8, v: .25 + Math.random() * .7, a: .25 + Math.random() * .6, w: Math.random() * 6.3, c: Math.random() < .25 ? '79,216,255' : '91,140,255' }; };
    size(); for (var i = 0; i < (small ? 24 : 56); i++) P.push(mk(true));
    var draw = function () {
      if (!run) return; ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) { var p = P[i]; p.y -= p.v; p.w += .02; p.x += Math.sin(p.w) * .3; if (p.y < -10) { P[i] = mk(false); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = 'rgba(' + p.c + ',' + (p.a * Math.min(1, p.y / (H * .35))).toFixed(3) + ')'; ctx.shadowColor = 'rgba(' + p.c + ',.9)'; ctx.shadowBlur = 8; ctx.fill(); }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw); addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !run) { run = true; requestAnimationFrame(draw); } else if (!v) run = false; }).observe(cv);
  }
})();
