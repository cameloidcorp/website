/* Cameloid Corp. — site behaviour */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu
  var btn = document.querySelector('.menu-btn');
  if (btn) btn.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // reveal on scroll
  var items = document.querySelectorAll('.rv, .rv-stairs, .rv-map');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  // year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // constellation sky (hero)
  var cv = document.querySelector('canvas.sky');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W, H, dpr, stars = [], lode;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(130, W * H / 9000));
      stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.82, r: Math.random() * 1.3 + 0.3, vx: (Math.random() - .5) * 0.06, vy: (Math.random() - .5) * 0.04, t: Math.random() * 6.28 });
      lode = { x: W * 0.78, y: H * 0.24 };
    }
    function draw(time) {
      ctx.clearRect(0, 0, W, H);
      var link = Math.min(150, W / 8);
      for (var i = 0; i < stars.length; i++) {
        var a = stars[i];
        for (var j = i + 1; j < stars.length; j++) {
          var b = stars[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) { ctx.strokeStyle = 'rgba(159,202,240,' + (0.16 * (1 - d / link)) + ')'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        var dl = Math.hypot(a.x - lode.x, a.y - lode.y);
        if (dl < link * 1.6) { ctx.strokeStyle = 'rgba(201,150,43,' + (0.22 * (1 - dl / (link * 1.6))) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(lode.x, lode.y); ctx.stroke(); }
      }
      for (var k = 0; k < stars.length; k++) {
        var s = stars[k], tw = 0.55 + 0.45 * Math.sin(s.t + time / 900);
        ctx.fillStyle = 'rgba(230,240,250,' + (0.35 + 0.5 * tw) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
        if (!reduce) { s.x += s.vx; s.y += s.vy; if (s.x < 0 || s.x > W) s.vx *= -1; if (s.y < 0 || s.y > H * .82) s.vy *= -1; }
      }
      // the lodestar
      var g = ctx.createRadialGradient(lode.x, lode.y, 0, lode.x, lode.y, 38);
      g.addColorStop(0, 'rgba(255,236,190,.9)'); g.addColorStop(.18, 'rgba(201,150,43,.45)'); g.addColorStop(1, 'rgba(201,150,43,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lode.x, lode.y, 38, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(255,236,190,.55)'; ctx.lineWidth = 1;
      var L = 16 + 3 * Math.sin(time / 1200);
      ctx.beginPath(); ctx.moveTo(lode.x - L, lode.y); ctx.lineTo(lode.x + L, lode.y); ctx.moveTo(lode.x, lode.y - L); ctx.lineTo(lode.x, lode.y + L); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lode.x, lode.y, 2.4, 0, 6.283); ctx.fill();
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); window.addEventListener('resize', size); requestAnimationFrame(draw);
  }

  // contact form → composes an email (no third-party service needed)
  var form = document.querySelector('form.cform');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var subject = 'Website enquiry: ' + f.topic.value + (f.org.value ? ' (' + f.org.value + ')' : '');
    var body = f.message.value + '\n\n' + f.name.value + (f.org.value ? '\n' + f.org.value : '') + '\n' + f.email.value + (f.country.value ? '\n' + f.country.value : '');
    window.location.href = 'mailto:info@cameloid.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    var n = document.querySelector('.form-sent'); if (n) n.hidden = false;
  });
})();
