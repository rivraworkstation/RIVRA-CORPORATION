/* ============================================================
   RIVRA CORPORATION — script.js
   ============================================================ */

/* ---- Custom Cursor ---- */
const cursorOuter = document.getElementById('cursor-outer');
const cursorInner = document.getElementById('cursor-inner');

let mx = -100, my = -100, ox = -100, oy = -100;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursorInner) { cursorInner.style.left = mx + 'px'; cursorInner.style.top = my + 'px'; }
});

(function cursorLoop() {
  ox += (mx - ox) * 0.13;
  oy += (my - oy) * 0.13;
  if (cursorOuter) { cursorOuter.style.left = ox + 'px'; cursorOuter.style.top = oy + 'px'; }
  requestAnimationFrame(cursorLoop);
})();

document.querySelectorAll('a, button, .btn, .service-card, .gold-card, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorOuter) { cursorOuter.style.width = '54px'; cursorOuter.style.height = '54px'; cursorOuter.style.background = 'rgba(201,168,76,0.08)'; }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorOuter) { cursorOuter.style.width = '36px'; cursorOuter.style.height = '36px'; cursorOuter.style.background = 'transparent'; }
  });
});

/* ---- Click Ripple ---- */
document.addEventListener('click', e => {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

/* ---- Mobile Nav ---- */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

/* ---- Active Nav Link ---- */
const navLinks = document.querySelectorAll('nav a, .mobile-nav a');
navLinks.forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

/* ---- Scroll Reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- Three.js Golden Lines ---- */
(function initThree() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  function resize() {
    const W = window.innerWidth, H = window.innerHeight;
    renderer.setSize(W, H);
    camera.left = -W / 2; camera.right = W / 2;
    camera.top = H / 2; camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    buildLines();
  }

  const LINE_COUNT = 14;
  const lineGroup = new THREE.Group();
  scene.add(lineGroup);

  const goldColor = new THREE.Color(0xC9A84C);

  const lines = [];

  function buildLines() {
    // Clear old
    while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0]);
    lines.length = 0;

    const W = window.innerWidth, H = window.innerHeight;

    for (let i = 0; i < LINE_COUNT; i++) {
      const geo = new THREE.BufferGeometry();
      const ptCount = Math.floor(40 + Math.random() * 60);
      const positions = new Float32Array(ptCount * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.LineBasicMaterial({
        color: goldColor,
        opacity: 0.03 + Math.random() * 0.08,
        transparent: true,
      });

      const line = new THREE.Line(geo, mat);
      lineGroup.add(line);

      const data = {
        line,
        positions,
        ptCount,
        speed: 0.12 + Math.random() * 0.28,
        offset: Math.random() * Math.PI * 2,
        amplitude: (0.1 + Math.random() * 0.3) * H,
        waveFreq: 0.002 + Math.random() * 0.006,
        y: (Math.random() - 0.5) * H,
        drift: (Math.random() - 0.5) * 0.04,
        W, H,
      };
      lines.push(data);
    }
  }

  function updateLine(d, t) {
    const { positions, ptCount, speed, offset, amplitude, waveFreq, W, H } = d;
    d.y += d.drift;
    if (d.y > H * 0.6) d.drift = -Math.abs(d.drift);
    if (d.y < -H * 0.6) d.drift = Math.abs(d.drift);

    for (let j = 0; j < ptCount; j++) {
      const frac = j / (ptCount - 1);
      const x = (frac - 0.5) * (W + 200);
      const y = d.y + Math.sin(frac * Math.PI * 2.5 + t * speed + offset) * amplitude * 0.25
                     + Math.sin(frac * Math.PI * 5 + t * speed * 1.7 + offset * 2) * amplitude * 0.08;
      positions[j * 3] = x;
      positions[j * 3 + 1] = y;
      positions[j * 3 + 2] = 0;
    }
    d.line.geometry.attributes.position.needsUpdate = true;
  }

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    lines.forEach(d => updateLine(d, t));
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener('resize', resize);
  animate();
})();

/* ---- Page fade-in ---- */
document.querySelector('.page-content') && document.querySelector('.page-content').classList.add('page-fade');

/* ---- Smooth anchor scrolling for internal links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- Counter animation on stat cards ---- */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const startVal = 0;
  const suffix = el.dataset.suffix || '';
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(startVal + (target - startVal) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const val = parseFloat(el.dataset.count);
      animateCounter(el, val);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ---- Contact Form ---- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type=submit]');
    const successMsg = document.getElementById('form-success');
    const fields = { name: contactForm.name, email: contactForm.email, subject: contactForm.subject, message: contactForm.message };

    // Validation
    let valid = true;
    Object.entries(fields).forEach(([key, field]) => {
      const errEl = document.getElementById(`err-${key}`);
      if (errEl) errEl.classList.remove('show');
      if (!field || !field.value.trim()) {
        if (errEl) errEl.classList.add('show');
        valid = false;
      }
    });
    if (fields.email && fields.email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
      const errEl = document.getElementById('err-email');
      if (errEl) { errEl.textContent = 'Please enter a valid email address.'; errEl.classList.add('show'); }
      valid = false;
    }
    if (!valid) return;

    btn.textContent = 'Sending…'; btn.disabled = true;

    // EmailJS integration
    if (typeof emailjs !== 'undefined') {
      try {
        await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
          from_name: fields.name.value,
          from_email: fields.email.value,
          subject: fields.subject.value,
          message: fields.message.value,
          to_email: 'corporationrivra@gmail.com',
        });
        contactForm.reset();
        if (successMsg) successMsg.classList.add('show');
      } catch (err) {
        alert('Failed to send message. Please try again or email us directly.');
      }
    } else {
      // Fallback: mailto
      const body = encodeURIComponent(`Name: ${fields.name.value}\nEmail: ${fields.email.value}\n\n${fields.message.value}`);
      window.location.href = `mailto:corporationrivra@gmail.com?subject=${encodeURIComponent(fields.subject.value)}&body=${body}`;
      contactForm.reset();
      if (successMsg) successMsg.classList.add('show');
    }

    btn.textContent = 'Send Message'; btn.disabled = false;
  });
}