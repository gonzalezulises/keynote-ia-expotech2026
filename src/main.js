import './style.css';

// ---- State ----
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
let currentSlide = 0;
let notesVisible = false;

// ---- DOM refs ----
const progressBar = document.getElementById('progress-bar');
const indicator = document.getElementById('slide-indicator');
const notesPanel = document.getElementById('speaker-notes');
const notesContent = document.getElementById('speaker-notes-content');
const closeNotesBtn = document.getElementById('close-notes');

// ---- Navigation ----
function goToSlide(index) {
  if (index < 0 || index >= totalSlides) return;
  currentSlide = index;
  slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
  updateUI();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function updateUI() {
  // Progress bar
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  progressBar.style.width = `${progress}%`;

  // Indicator
  indicator.textContent = `${currentSlide + 1} / ${totalSlides}`;

  // Speaker notes
  const notes = slides[currentSlide].getAttribute('data-notes');
  if (notes) {
    notesContent.textContent = notes;
  } else {
    notesContent.textContent = '(Sin notas para este slide)';
  }

  // URL hash
  history.replaceState(null, '', `#${currentSlide + 1}`);
}

// ---- Detect current slide from scroll ----
function detectCurrentSlide() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  let closest = 0;
  let minDiff = Infinity;

  slides.forEach((slide, i) => {
    const diff = Math.abs(slide.offsetTop - scrollTop);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  });

  if (closest !== currentSlide) {
    currentSlide = closest;
    updateUI();
  }
}

// ---- Speaker Notes Toggle ----
function toggleNotes() {
  notesVisible = !notesVisible;
  notesPanel.classList.toggle('hidden', !notesVisible);
}

// ---- Fullscreen Toggle ----
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

// ---- Keyboard Controls ----
document.addEventListener('keydown', (e) => {
  // Ignore if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case ' ':
    case 'PageDown':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      prevSlide();
      break;
    case 'Home':
      e.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      e.preventDefault();
      goToSlide(totalSlides - 1);
      break;
    case 'n':
    case 'N':
      e.preventDefault();
      toggleNotes();
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      toggleFullscreen();
      break;
    case 'Escape':
      if (notesVisible) {
        toggleNotes();
      }
      break;
  }
});

// ---- Close notes button ----
closeNotesBtn.addEventListener('click', () => {
  notesVisible = true; // will be toggled to false
  toggleNotes();
});

// ---- Scroll detection (debounced) ----
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(detectCurrentSlide, 100);
}, { passive: true });

// ---- Touch/swipe support ----
let touchStartY = 0;
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const deltaY = touchStartY - e.changedTouches[0].clientY;
  const deltaX = touchStartX - e.changedTouches[0].clientX;

  // Only trigger on significant vertical swipes (not horizontal)
  if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
    if (deltaY > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
}, { passive: true });

// ---- Click on edges ----
document.addEventListener('click', (e) => {
  // Don't navigate if clicking on notes panel or buttons
  if (e.target.closest('#speaker-notes') || e.target.closest('button') || e.target.closest('a')) return;

  const x = e.clientX;
  const width = window.innerWidth;

  if (x < width * 0.15) {
    prevSlide();
  } else if (x > width * 0.85) {
    nextSlide();
  }
});

// ---- Init from URL hash ----
function init() {
  const hash = window.location.hash;
  if (hash) {
    const num = parseInt(hash.slice(1), 10);
    if (num >= 1 && num <= totalSlides) {
      currentSlide = num - 1;
      slides[currentSlide].scrollIntoView();
    }
  }
  updateUI();
}

init();
