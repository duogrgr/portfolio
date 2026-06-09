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
  
  // ===== UI СЕКЦИИ (НЕЗАВИСИМЫЕ КАРУСЕЛИ) =====
  const uiSections = document.querySelectorAll('.ui-section');
  
  uiSections.forEach(section => {
    const carousel = section.querySelector('.section-carousel');
    const counter = section.querySelector('.section-counter');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    
    function updateCounter(index) {
      counter.textContent = `${index + 1} / ${totalSlides}`;
    }
    
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = carousel.scrollLeft;
        const slideWidth = carousel.offsetWidth;
        const newIndex = Math.round(scrollLeft / slideWidth);
        
        if (newIndex !== currentSlide && newIndex >= 0 && newIndex < totalSlides) {
          currentSlide = newIndex;
          updateCounter(currentSlide);
        }
      }, 100);
    });
    
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentSlide < totalSlides - 1) {
          currentSlide++;
          slides[currentSlide].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
          updateCounter(currentSlide);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSlide > 0) {
          currentSlide--;
          slides[currentSlide].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
          updateCounter(currentSlide);
        }
      }
    });
    
    updateCounter(0);
  });
  
  // ===== PROGRESS BAR =====
  const progressBars = document.querySelectorAll('.progress-bar-container');
  
  progressBars.forEach(progressBar => {
    const fill = progressBar.querySelector('.progress-bar-fill');
    const text = progressBar.querySelector('.progress-bar-text');
    let animationFrameId = null;

    function animateProgress(duration) {
      fill.style.width = '0%';
      text.textContent = '0%';
      
      const startTime = performance.now();
      
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const percentage = Math.round(progress * 100);
        
        fill.style.width = `${percentage}%`;
        text.textContent = `${percentage}%`;
        
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(update);
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
  });
  
  // ===== CURSOR TRAIL ДЛЯ AMB СЕКЦИИ (GSAP DEMO STYLE) =====
  const ambZone = document.getElementById('ambZone');
  const trailContainer = document.getElementById('trailContainer');
  
  if (ambZone && trailContainer && typeof gsap !== 'undefined') {
    const shapes = ['shape-circle', 'shape-square', 'shape-triangle', 'shape-diamond', 
                    'shape-star', 'shape-hexagon', 'shape-plus', 'shape-ring'];
    const gap = 100; // Расстояние в пикселях между созданиями
    let lastMousePos = { x: 0, y: 0 };
    let mousePos = { x: 0, y: 0 };
    let shapeIndex = 0;
    
    // Wrap для зацикливания индекса
    const wrapIndex = gsap.utils.wrap(0, shapes.length);
    
    // Отслеживание мыши
    ambZone.addEventListener('mousemove', (e) => {
      const rect = ambZone.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      
      if (typeof audioEngine !== 'undefined') {
        audioEngine.init();
      }
    });
    
    // Touch поддержка
    ambZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = ambZone.getBoundingClientRect();
      mousePos.x = e.touches[0].clientX - rect.left;
      mousePos.y = e.touches[0].clientY - rect.top;
      
      if (typeof audioEngine !== 'undefined') {
        audioEngine.init();
      }
    }, { passive: false });
    
    // Функция создания и анимации элемента
    function createTrailShape() {
      const shape = document.createElement('div');
      const shapeClass = shapes[wrapIndex(shapeIndex++)];
      shape.className = `trail-shape ${shapeClass}`;
      
      trailContainer.appendChild(shape);
      
      // Центрирование
      gsap.set(shape, {
        x: mousePos.x,
        y: mousePos.y,
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 1
      });
      
      // Timeline анимация
      const tl = gsap.timeline({
        onComplete: () => shape.remove()
      });
      
      tl.from(shape, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "elastic.out(1, 0.3)"
      })
      .to(shape, {
        rotation: "random([-360, 360])",
        duration: 0.5,
        ease: "power2.out"
      }, "<")
      .to(shape, {
        y: "+=150",
        opacity: 0,
        duration: 0.8,
        ease: "back.in(2)"
      }, 0.3);
      
      // Играем следующий звук
      if (typeof audioEngine !== 'undefined') {
        audioEngine.playNextTrigger();
      }
    }
    
    // gsap.ticker вместо requestAnimationFrame
    gsap.ticker.add(() => {
      const travelDistance = Math.hypot(
        lastMousePos.x - mousePos.x,
        lastMousePos.y - mousePos.y
      );
      
      if (travelDistance > gap) {
        createTrailShape();
        lastMousePos = { ...mousePos };
      }
    });
  }
  
  console.log('Portfolio initialized successfully!');
});