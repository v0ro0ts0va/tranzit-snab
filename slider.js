document.addEventListener('DOMContentLoaded', function() {
  const slidesContainer = document.querySelector('.service-slides-container');
  const slides = document.querySelectorAll('.service-slide');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.prev-button');
  const nextBtn = document.querySelector('.next-button');
  let currentSlide = 0;
  const slideCount = slides.length;
  // Инициализация слайдера
  function initSlider() {
    // Создаем точки
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }
  // Переход к конкретному слайду
  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
  }
  // Обновление состояния слайдера
  function updateSlider() {
    const offset = -currentSlide * 100;
    slidesContainer.style.transform = `translateX(${offset}%)`;
    // Обновляем точки
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }
  // Обработчики кнопок
  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateSlider();
  });
  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slideCount;
    updateSlider();
  });
  // Инициализация
  initSlider();
});
