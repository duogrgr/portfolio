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
      // Сбрасываем к 0%
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
      
      // Отменяем предыдущую анимацию (если была)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Запускаем новую анимацию
      animationFrameId = requestAnimationFrame(update);
    }

    progressBar.addEventListener('click', () => {
      if (typeof audioEngine !== 'undefined') {
        audioEngine.init();
        audioEngine.playUI('slider');
      }
      
      const duration = parseInt(progressBar.getAttribute('data-duration')) || 3000;
      
      // Запускаем анимацию (она сама отменит предыдущую)
      animateProgress(duration);
    });
  }
  
  console.log('Portfolio initialized successfully!');
});