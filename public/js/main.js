// ============================================
// EVVAL OTEL — Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {

  // ===== 1. LOADING SCREEN =====
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.add('loaded');
    }, 1800);
  }

  // ===== 2. NAVBAR SCROLL =====
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // ===== 3. MOBILE HAMBURGER =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== 4. SCROLL REVEAL =====
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ===== 5. TESTIMONIAL CAROUSEL =====
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (slides.length && dots.length) {
    let currentSlide = 0;

    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        showSlide(parseInt(dot.dataset.index));
      });
    });

    setInterval(() => {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
    }, 5000);
  }

  // ===== 6. COUNTER ANIMATION =====
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          const target = parseInt(entry.target.dataset.count);
          animateCounter(entry.target, target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(element, target) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target.toLocaleString('tr-TR');
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current).toLocaleString('tr-TR');
        }
      }, duration / steps);
    }
  }

  // ===== 7. WHATSAPP BUTTON =====
  const whatsappBtn = document.getElementById('whatsappBtn');
  if (whatsappBtn) {
    const phone = whatsappBtn.dataset.phone || '905551234567';
    whatsappBtn.addEventListener('click', () => {
      window.open(`https://wa.me/${phone}?text=Merhaba%2C%20Evval%20Otel%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.`, '_blank');
    });
  }

  // ===== 8. FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ===== 9. LIGHTBOX =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  if (lightbox && lightboxImg) {
    const lightboxImages = document.querySelectorAll('[data-lightbox]');
    let currentIndex = 0;

    lightboxImages.forEach((img, index) => {
      img.addEventListener('click', () => {
        currentIndex = index;
        openLightbox(img.dataset.src || img.src);
      });
    });

    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    window.closeLightbox = function() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-prev')?.addEventListener('click', () => {
      const images = document.querySelectorAll('[data-lightbox]');
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentIndex].dataset.src || images[currentIndex].src;
    });
    document.querySelector('.lightbox-next')?.addEventListener('click', () => {
      const images = document.querySelectorAll('[data-lightbox]');
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = images[currentIndex].dataset.src || images[currentIndex].src;
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') document.querySelector('.lightbox-prev')?.click();
      if (e.key === 'ArrowRight') document.querySelector('.lightbox-next')?.click();
    });
  }

  // ===== 10. LANGUAGE SWITCHER =====
  const langButtons = document.querySelectorAll('.lang-switch button');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.textContent.toLowerCase();
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.location.href = url.toString();
    });
  });

  // ===== 11. SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 100;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});
