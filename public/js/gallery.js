// ============================================
// EVVAL OTEL — Gallery Lightbox
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // ===== LIGHTBOX SETUP =====
  const lightboxHTML = `
    <div class="lightbox" id="lightbox">
      <button class="lightbox-close" onclick="closeLightbox()">✕</button>
      <button class="lightbox-prev">‹</button>
      <button class="lightbox-next">›</button>
      <img id="lightboxImg" src="" alt="">
    </div>
  `;
  
  if (!document.getElementById('lightbox')) {
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxImages = document.querySelectorAll('[data-lightbox]');
  let currentIndex = 0;

  lightboxImages.forEach((img, index) => {
    img.addEventListener('click', function(e) {
      e.preventDefault();
      currentIndex = index;
      const src = this.dataset.src || this.src;
      openLightbox(src);
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

  document.querySelector('.lightbox-prev')?.addEventListener('click', function(e) {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + lightboxImages.length) % lightboxImages.length;
    const img = lightboxImages[currentIndex];
    lightboxImg.src = img.dataset.src || img.src;
  });

  document.querySelector('.lightbox-next')?.addEventListener('click', function(e) {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % lightboxImages.length;
    const img = lightboxImages[currentIndex];
    lightboxImg.src = img.dataset.src || img.src;
  });

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.querySelector('.lightbox-prev')?.click();
    if (e.key === 'ArrowRight') document.querySelector('.lightbox-next')?.click();
  });

  // ===== GALLERY FILTER =====
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const filter = this.dataset.filter;
        
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
            setTimeout(() => item.style.opacity = '1', 50);
          } else {
            item.style.opacity = '0';
            setTimeout(() => item.style.display = 'none', 300);
          }
        });
      });
    });
  }
});
