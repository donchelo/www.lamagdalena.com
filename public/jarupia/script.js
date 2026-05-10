/* script.js — Jarupia Landing Page */

// ============================
// Scroll reveal animations
// ============================
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach((el) => observer.observe(el));

// ============================
// Add reveal class dynamically to sections
// ============================
document.querySelectorAll(
  '.sinopsis-ilus, .sinopsis-text, .autor-text, .autor-visual, .ferias-col, .spec-item, .spec-detail, .galeria-header'
).forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 3 === 1) el.classList.add('reveal-delay-1');
  if (i % 3 === 2) el.classList.add('reveal-delay-2');
  observer.observe(el);
});

// ============================
// Illustration horizontal drag scroll
// ============================
const ilusWrapper = document.querySelector('.ilus-scroll-wrapper');
let isDown = false;
let startX;
let scrollLeft;

if (ilusWrapper) {
  ilusWrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    ilusWrapper.classList.add('active');
    startX = e.pageX - ilusWrapper.offsetLeft;
    scrollLeft = ilusWrapper.scrollLeft;
  });

  ilusWrapper.addEventListener('mouseleave', () => {
    isDown = false;
    ilusWrapper.classList.remove('active');
  });

  ilusWrapper.addEventListener('mouseup', () => {
    isDown = false;
    ilusWrapper.classList.remove('active');
  });

  ilusWrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - ilusWrapper.offsetLeft;
    const walk = (x - startX) * 1.8;
    ilusWrapper.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  ilusWrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX - ilusWrapper.offsetLeft;
    scrollLeft = ilusWrapper.scrollLeft;
  });

  ilusWrapper.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX - ilusWrapper.offsetLeft;
    const walk = (x - startX) * 1.8;
    ilusWrapper.scrollLeft = scrollLeft - walk;
  });

  // Auto scroll hint on load
  setTimeout(() => {
    ilusWrapper.scrollTo({ left: 120, behavior: 'smooth' });
    setTimeout(() => {
      ilusWrapper.scrollTo({ left: 0, behavior: 'smooth' });
    }, 800);
  }, 2000);
}

// ============================
// Hero parallax on scroll
// ============================
const heroPhoto = document.querySelector('.hero-photo');
const heroIllus = document.querySelector('.hero-illustration');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (heroPhoto) {
    heroPhoto.style.transform = `translateY(${scrolled * 0.3}px)`;
  }
  if (heroIllus) {
    heroIllus.style.transform = `translateY(${scrolled * 0.15}px)`;
  }
}, { passive: true });

// ============================
// Smooth scroll for anchor links
// ============================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

console.log('🌊 Jarupia — El secreto de Ayapel');
