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
  
  // ===== CURSOR TRAIL ДЛЯ AMB СЕКЦИИ (ИСПРАВЛЕННЫЙ) =====
  const ambZone = document.getElementById('ambZone');
  
  if (ambZone && typeof gsap !== 'undefined') {
    const TRAIL_COUNT = 20;
    const FLY_THRESHOLD = 50;
    const GAP_TIME = 250;

    let mouseX = 0;
    let mouseY = 0;
    let lastFlyTime = 0;

    const trailElements = [];
    const positions = [];
    const isFlying = []; // Состояние "вылета" для каждого элемента

    // Инициализация элементов
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'trail-element';
      ambZone.appendChild(el);
      trailElements.push(el);
      positions.push({ x: 0, y: 0 });
      isFlying.push(false);
    }

    // Отслеживание мыши
    ambZone.addEventListener('mousemove', (e) => {
      const rect = ambZone.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (typeof audioEngine !== 'undefined') audioEngine.init();
    });

    // Отслеживание тача
    ambZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = ambZone.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
      if (typeof audioEngine !== 'undefined') audioEngine.init();
    }, { passive: false });

    // Функция "вылета" элемента
    function triggerFlyOut(index) {
      const el = trailElements[index];
      const currentTime = Date.now();

      // Проверка gap
      if (currentTime - lastFlyTime < GAP_TIME) return;

      lastFlyTime = currentTime;
      isFlying[index] = true; // Блокируем обновление позиции в цикле

      // Анимация падения вниз + 3D вращение + исчезновение
      gsap.to(el, {
        y: '+=120',
        opacity: 0,
        rotationX: Math.random() * 360,
        rotationY: Math.random() * 360,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => {
          isFlying[index] = false; // Разблокируем элемент
          // Мгновенно возвращаем на текущую расчетную позицию и сбрасываем прозрачность/вращение
          gsap.set(el, { 
            opacity: 1, 
            rotationX: 0, 
            rotationY: 0, 
            rotationZ: 0 
          });
        }
      });

      // Играем следующий звук
      if (typeof audioEngine !== 'undefined') {
        audioEngine.playNextTrigger();
      }
    }

    // Главный цикл анимации
    function animate() {
      const currentTime = Date.now();

      // 1. Первый элемент следует за курсором
      if (!isFlying[0]) {
        positions[0].x += (mouseX - positions[0].x) * 0.25;
        positions[0].y += (mouseY - positions[0].y) * 0.25;

        const dist0 = Math.hypot(mouseX - positions[0].x, mouseY - positions[0].y);
        if (dist0 > FLY_THRESHOLD && currentTime - lastFlyTime >= GAP_TIME) {
          triggerFlyOut(0);
        }

        gsap.set(trailElements[0], {
          x: positions[0].x,
          y: positions[0].y,
          rotationX: positions[0].y * 0.3,
          rotationY: positions[0].x * 0.3,
          rotationZ: 0
        });
      }

      // 2. Остальные элементы следуют за предыдущими
      for (let i = 1; i < TRAIL_COUNT; i++) {
        if (!isFlying[i]) {
          const prev = positions[i - 1];
          positions[i].x += (prev.x - positions[i].x) * 0.2;
          positions[i].y += (prev.y - positions[i].y) * 0.2;

          const dist = Math.hypot(prev.x - positions[i].x, prev.y - positions[i].y);
          if (dist > FLY_THRESHOLD && currentTime - lastFlyTime >= GAP_TIME) {
            triggerFlyOut(i);
          }

          gsap.set(trailElements[i], {
            x: positions[i].x,
            y: positions[i].y,
            rotationX: positions[i].y * 0.3,
            rotationY: positions[i].x * 0.3,
            rotationZ: i * 18
          });
        }
      }

      requestAnimationFrame(animate);
    }

    // Запуск цикла
    animate();
  }
  
  console.log('Portfolio initialized successfully!');
});