// ==========================
// STATE
// ==========================
let projectData = [];
let currentIndex = 0;
let images = [];

// Swipe
let startX = 0;
let endX = 0;
const threshold = 50;

// ==========================
// ELEMENTS
// ==========================
const gallery = document.getElementById('gallery');

const viewer = document.getElementById('project-viewer');
const viewerScroll = document.getElementById('viewer-scroll');
const viewerClose = document.getElementById('viewer-close');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const closeBtn = document.getElementById('close');

// NEW: counter
const counter = document.getElementById('counter');


// ==========================
// LOAD PROJECTS
// ==========================
fetch('/projects.json')
  .then(res => res.json())
  .then(data => {
    projectData = data;

    data.forEach((project, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      item.innerHTML = `
        <img src="${project.folder + project.images[0]}" data-index="${index}">
        <div class="overlay">
          <h3>${project.title}</h3>
          <p>${project.desc}</p>
        </div>
      `;

      gallery.appendChild(item);
    });

    initClicks();
  });


// ==========================
// PROJECT VIEWER
// ==========================
function initClicks() {
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
      openProject(img.dataset.index);
    });
  });
}

function openProject(index) {
  const project = projectData[index];

  viewerScroll.innerHTML = '';

  project.images.forEach((file, i) => {
    const img = document.createElement('img');
    img.src = project.folder + file;

    img.addEventListener('click', () => {
      showFullscreen(i);
    });

    viewerScroll.appendChild(img);
  });

  images = viewerScroll.querySelectorAll('img');
  currentIndex = 0;

  viewer.offsetHeight;
  viewer.classList.add('active');

  // Center first image
  setTimeout(() => {
    images[0].scrollIntoView({ inline: 'center' });
  }, 50);
}


// ==========================
// LIGHTBOX
// ==========================
function showFullscreen(index) {
  currentIndex = index;
  lightboxImg.src = images[index].src;

  updateCounter();

  lightbox.classList.add('active');
}

function closeLightbox() {
  lightbox.classList.remove('active');
}


// ==========================
// NAVIGATION
// ==========================
function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  lightboxImg.src = images[currentIndex].src;

  updateCounter();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  lightboxImg.src = images[currentIndex].src;

  updateCounter();
}


// ==========================
// COUNTER
// ==========================
function updateCounter() {
  if (!counter) return;
  counter.textContent = `${currentIndex + 1} / ${images.length}`;
}


// ==========================
// SWIPE (LIGHTWEIGHT)
// ==========================
lightbox.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

lightbox.addEventListener('touchmove', e => {
  endX = e.touches[0].clientX;
});

lightbox.addEventListener('touchend', () => {
  let diff = startX - endX;

  if (Math.abs(diff) > threshold) {
    diff > 0 ? nextImage() : prevImage();
  }
});


// ==========================
// CLICK ZONES (NEW)
// ==========================
lightbox.addEventListener('click', (e) => {
  // Only trigger if clicking the image itself
  if (e.target !== lightboxImg) return;

  const x = e.clientX;
  const width = window.innerWidth;

  if (x < width / 2) {
    prevImage();
  } else {
    nextImage();
  }
});


// ==========================
// EVENTS
// ==========================
nextBtn.onclick = nextImage;
prevBtn.onclick = prevImage;
closeBtn.onclick = closeLightbox;

viewerClose.onclick = () => viewer.classList.remove('active');

// Keyboard
document.addEventListener('keydown', e => {

  if (lightbox.classList.contains('active')) {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  }

  else if (viewer.classList.contains('active')) {
    if (e.key === 'Escape') viewer.classList.remove('active');
  }

});

// Click outside to close
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

viewer.addEventListener('click', e => {
  if (e.target === viewer) viewer.classList.remove('active');
});