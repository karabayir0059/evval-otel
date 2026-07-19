// ============================================
// EVVAL OTEL — Booking Form
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const bookingForm = document.getElementById('bookingForm');
  if (!bookingForm) return;

  const steps = document.querySelectorAll('.booking-step');
  const stepNums = document.querySelectorAll('.booking-step-num');
  const prevBtn = document.getElementById('bookingPrev');
  const nextBtn = document.getElementById('bookingNext');
  const submitBtn = document.getElementById('bookingSubmit');
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    stepNums.forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i === index) s.classList.add('active');
      else if (i < index) s.classList.add('done');
    });
    if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'inline-flex';
    if (nextBtn) nextBtn.style.display = index === steps.length - 1 ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = index === steps.length - 1 ? 'inline-flex' : 'none';
    currentStep = index;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) showStep(currentStep + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const formData = new FormData(bookingForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          bookingForm.innerHTML = `
            <div style="text-align:center;padding:60px 0;">
              <div style="font-size:3rem;margin-bottom:20px;color:var(--gold);">✓</div>
              <h2 style="font-family:var(--font-heading);font-size:2rem;color:var(--brown-dark);margin-bottom:16px;">
                Teşekkür Ederiz!
              </h2>
              <p style="color:var(--text-light);font-size:1.1rem;">
                Rezervasyon talebiniz alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.
              </p>
            </div>
          `;
        }
      } catch (err) {
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    });
  }

  // Tarih seçici bugün ve sonrası
  const dateInputs = bookingForm.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.setAttribute('min', today);
  });

  showStep(0);
});
