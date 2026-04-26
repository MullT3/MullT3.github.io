let projectData = [];
let images = [];
let viewerIndex = 0;
let currentIndex = 0;

// drag
let startX = 0;
let deltaX = 0;
let dragging = false;

const gallery = document.getElementById('gallery');

const viewer = document.getElementById('project-viewer');
const viewerScroll = document.getElementById('viewer-scroll');
const viewerClose = document.getElementById('viewer-close');
const viewerCounter = document.getElementById('viewer-counter');

const viewerLeft = document.getElementById('viewer-left');
const viewerRight = document.getElementById('viewer-right');

const fullscreen = document.getElementById('fullscreen-viewer');
const fsImg = document.getElementById('fullscreen-img');
const fsClose = document.getElementById('fs-close');

const viewerExit = document.getElementById('viewer-exit');

// LOAD DATA
fetch('/projects.json')
  .then(res => res.json())
  .then(data => {
    projectData = data;

    data.forEach((project, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      item.innerHTML = `
        <img src="${project.folder + project.images[0]}" data-index="${i}">
        <div class="overlay">
          <strong>${project.title}</strong><br>
          ${project.desc}
        </div>
      `;

      gallery.appendChild(item);
    });

    document.querySelectorAll('.gallery img').forEach(img => {
      img.onclick = () => openProject(img.dataset.index);
    });
  });


// OPEN VIEWER
function openProject(index) {
  const project = projectData[index];
  viewerScroll.innerHTML = '';

  project.images.forEach((file, i) => {
    const img = document.createElement('img');
    img.src = project.folder + file;

    // hover zone detection
    img.addEventListener('mousemove', (e) => {
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x > rect.width * 0.3 && x < rect.width * 0.7) {
        img.classList.add('center-hover');
      } else {
        img.classList.remove('center-hover');
      }
    });

    // click zones
    img.onclick = (e) => {
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x < rect.width * 0.3) viewerPrev();
      else if (x > rect.width * 0.7) viewerNext();
      else openFullscreen(i);
    };

    viewerScroll.appendChild(img);
  });

  images = viewerScroll.querySelectorAll('img');
  viewerIndex = 0;

  updateCounter();

  viewer.classList.add('active');
}


// VIEWER NAV
function viewerNext() {
  viewerIndex = (viewerIndex + 1) % images.length;
  images[viewerIndex].scrollIntoView({ behavior: "smooth", inline: "center" });
  updateCounter();
}

function viewerPrev() {
  viewerIndex = (viewerIndex - 1 + images.length) % images.length;
  images[viewerIndex].scrollIntoView({ behavior: "smooth", inline: "center" });
  updateCounter();
}

function updateCounter() {
  viewerCounter.textContent = `${viewerIndex + 1} / ${images.length}`;
}


// ZONE CLICK
viewerLeft.onclick = (e) => {
  e.stopPropagation();
  viewerPrev();
};

viewerRight.onclick = (e) => {
  e.stopPropagation();
  viewerNext();
};


// VIEWER SWIPE
let vStartX = 0;

viewer.addEventListener('touchstart', (e) => {
  vStartX = e.touches[0].clientX;
});

viewer.addEventListener('touchend', (e) => {
  const diff = vStartX - e.changedTouches[0].clientX;

  if (Math.abs(diff) > 50) {
    diff > 0 ? viewerNext() : viewerPrev();
  }
});


// FULLSCREEN
function openFullscreen(i) {
  currentIndex = i;
  fsImg.src = images[i].src;
  fullscreen.classList.add('active');
}

function next() {
  currentIndex = (currentIndex + 1) % images.length;
  fsImg.src = images[currentIndex].src;
}

function prev() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  fsImg.src = images[currentIndex].src;
}


// DRAG FULLSCREEN
fullscreen.addEventListener('mousedown', e => {
  dragging = true;
  startX = e.clientX;
});

fullscreen.addEventListener('mousemove', e => {
  if (!dragging) return;

  deltaX = e.clientX - startX;
  fsImg.style.transform = `translateX(${deltaX}px)`;
});

fullscreen.addEventListener('mouseup', () => {
  if (!dragging) return;

  dragging = false;

  if (deltaX > 80) prev();
  else if (deltaX < -80) next();

  fsImg.style.transform = '';
  deltaX = 0;
});

fullscreen.addEventListener('mouseleave', () => {
  dragging = false;
  fsImg.style.transform = '';
});


// TOUCH FULLSCREEN
fullscreen.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

fullscreen.addEventListener('touchmove', e => {
  deltaX = e.touches[0].clientX - startX;
  fsImg.style.transform = `translateX(${deltaX}px)`;
});

fullscreen.addEventListener('touchend', () => {
  if (deltaX > 80) prev();
  else if (deltaX < -80) next();

  fsImg.style.transform = '';
  deltaX = 0;
});


// CLOSE
fsClose.onclick = (e) => {
  e.stopPropagation();
  fullscreen.classList.remove('active');
};

fullscreen.onclick = (e) => {
  if (e.target === fullscreen) fullscreen.classList.remove('active');
};

viewerClose.onclick = () => viewer.classList.remove('active');

viewer.onclick = (e) => {
  if (e.target === viewer) viewer.classList.remove('active');
};

// TOP RIGHT EXIT ZONE
viewerExit.onclick = (e) => {
  e.stopPropagation();
  viewer.classList.remove('active');
};

// KEYBOARD
document.addEventListener('keydown', e => {
  if (fullscreen.classList.contains('active')) {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') fullscreen.classList.remove('active');
  } else if (viewer.classList.contains('active')) {
    if (e.key === 'Escape') viewer.classList.remove('active');
  }
});