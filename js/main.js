// ===== НАВИГАЦИЯ И ПЕРЕКЛЮЧЕНИЕ СЕКЦИЙ =====
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  
  function switchPage(targetId) {
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    const targetPage = document.querySelector(targetId);
    if (targetPage) {
      targetPage.classList.add('active');
      window.scrollTo(0, 0);
    }
  }
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      switchPage(targetId);
    });
  });
  
  const backButtons = document.querySelectorAll('.nav-logo');
  backButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage('#home');
    });
  });
  
  // ===== МОДАЛЬНОЕ ОКНО ДЛЯ ВИДЕО =====
  const modal = document.getElementById('videoModal');
  const modalClose = document.getElementById('modalClose');
  const modalVideoContainer = document.getElementById('modalVideoContainer');
  const videoElements = document.querySelectorAll('.project-video');
  
  videoElements.forEach(videoEl => {
    videoEl.addEventListener('click', () => {
      const videoUrl = videoEl.getAttribute('data-video-url');
      
      if (videoUrl) {
        const iframe = document.createElement('iframe');
        iframe.src = `${videoUrl}?autoplay=1&rel=0`;
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        iframe.setAttribute('allowfullscreen', '');
        
        modalVideoContainer.innerHTML = '';
        modalVideoContainer.appendChild(iframe);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  function closeModal() {
    modal.classList.remove('active');
    modalVideoContainer.innerHTML = '';
    document.body.style.overflow = '';
  }
  
  modalClose.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  // ===== PROGRESS BAR (ПЕРЕЗАПУСК ПРИ КЛИКЕ) =====
  const progressBar = document.getElementById('progressBar');
  const progressBarFill = document.getElementById('progressBarFill');
  const progressBarText = document.getElementById('progressBarText');

  if (progressBar && progressBarFill && progressBarText) {
    let animationFrameId = null;

    function animateProgress(duration) {
      progressBarFill.style.width = '0%';
      progressBarText.textContent = '0%';
      
      const startTime = performance.now();
      
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const percentage = Math.round(progress * 100);
        
        progressBarFill.style.width = `${percentage}%`;
        progressBarText.textContent = `${percentage}%`;
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(update);
        } else {
          console.log('Progress bar animation complete');
        }
      }
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(update);
    }

    progressBar.addEventListener('click', () => {
      if (typeof audioEngine !== 'undefined') {
        audioEngine.init();
        audioEngine.playUI('slider');
      }
      
      const duration = parseInt(progressBar.getAttribute('data-duration')) || 3000;
      animateProgress(duration);
    });
  }
  
  // ===== UI КАРУСЕЛЬ С GSAP =====
  const uiCarousel = document.getElementById('uiCarousel');
  const indicators = document.querySelectorAll('.indicator');
  const counter = document.getElementById('carouselCounter');
  const totalSlides = document.querySelectorAll('.ui-slide').length;
  let currentSlide = 0;
  let isAnimating = false;

  function goToSlide(index) {
    if (isAnimating) return;
    isAnimating = true;
    
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentSlide = index;
    
    const slide = document.querySelector(`[data-slide="${index}"]`);
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    
    counter.textContent = `${index + 1} / ${totalSlides}`;
    
    animateSlideContent(slide);
    
    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  function animateSlideContent(slide) {
    if (!slide || typeof gsap === 'undefined') return;
    
    const elements = slide.querySelectorAll('.ui-element');
    
    gsap.set(elements, { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    });
    
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    });
  }

  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.getAttribute('data-index'));
      goToSlide(index);
    });
  });

  document.addEventListener('keydown', (e) => {
    const examplesPage = document.getElementById('examples');
    if (!examplesPage.classList.contains('active')) return;
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    }
  });

  let scrollTimeout;
  uiCarousel.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = uiCarousel.scrollLeft;
      const slideWidth = uiCarousel.offsetWidth;
      const newIndex = Math.round(scrollLeft / slideWidth);
      
      if (newIndex !== currentSlide && newIndex >= 0 && newIndex < totalSlides) {
        currentSlide = newIndex;
        
        indicators.forEach((ind, i) => {
          ind.classList.toggle('active', i === currentSlide);
        });
        
        counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
      }
    }, 100);
  });

  goToSlide(0);
  
  console.log('Portfolio initialized successfully!');
});