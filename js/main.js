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
    const sectionId = section.getAttribute('data-section');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    
    // Функция обновления счетчика
    function updateCounter(index) {
      counter.textContent = `${index + 1} / ${totalSlides}`;
    }
    
    // Отслеживание скролла для обновления счетчика
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
    
    // Клавиатурная навигация для активного блока
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
    
    // Инициализация
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
    // ===== MOUSETRAIL ДЛЯ AMB СЕКЦИИ =====
  const ambZone = document.getElementById('ambZone');
  
  if (ambZone && typeof gsap !== 'undefined') {
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    
    const MIN_DISTANCE = 25; // Минимальное расстояние в пикселях
    const MIN_TIME = 100;    // Минимальное время в мс
    
    const shapes = ['shape-circle', 'shape-square', 'shape-triangle'];

    function createParticle(x, y) {
      const particle = document.createElement('div');
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      particle.className = `trail-particle ${shape}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      ambZone.appendChild(particle);

      // 3D-анимация GSAP
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 150,
        z: (Math.random() - 0.5) * 300,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        rotationZ: Math.random() * 180,
        opacity: 0,
        scale: 0,
        duration: 1 + Math.random() * 0.5,
        ease: "power2.out",
        onComplete: () => particle.remove()
      });

      // Играем следующий звук из 8 триггеров
      if (typeof audioEngine !== 'undefined') {
        audioEngine.playNextTrigger();
      }
    }

    function handleMove(clientX, clientY) {
      const rect = ambZone.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const currentTime = Date.now();

      // Проверка границ (чтобы частицы не вылетали за пределы блока)
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      const distance = Math.hypot(x - lastX, y - lastY);
      const timeGap = currentTime - lastTime;

      // GAP-логика: создаем частицу только если прошли достаточно далеко и прошло достаточно времени
      if (distance > MIN_DISTANCE && timeGap > MIN_TIME) {
        createParticle(x, y);
        lastX = x;
        lastY = y;
        lastTime = currentTime;
      }
    }

    // Mouse events
    ambZone.addEventListener('mousemove', (e) => {
      // Работает только если зажата мышь (как в оригинальном AMB) или всегда? 
      // Давай сделаем всегда при наведении, это эффект трейла.
      handleMove(e.clientX, e.clientY);
    });

    // Touch events
    ambZone.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Блокируем скролл внутри зоны
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }, { passive: false });
  }
  console.log('Portfolio initialized successfully!');
});