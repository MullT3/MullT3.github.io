let projectData = [];
let images = [];
let viewerIndex = 0;
let currentIndex = 0;

const gallery = document.getElementById('gallery');

const viewer = document.getElementById('project-viewer');
const viewerScroll = document.getElementById('viewer-scroll');
const viewerCounter = document.getElementById('viewer-counter');

const viewerLeft = document.getElementById('viewer-left');
const viewerRight = document.getElementById('viewer-right');
const viewerExit = document.getElementById('viewer-exit');

const fullscreen = document.getElementById('fullscreen-viewer');
const fsImg = document.getElementById('fullscreen-img');

// LOAD
fetch('/projects.json')
.then(r => r.json())
.then(data => {
  projectData = data;

  data.forEach((p,i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    item.innerHTML = `
      <img src="${p.folder + p.images[0]}" data-index="${i}">
      <div class="overlay">
        <div class="title">${p.title}</div>
        <div class="subtitle">${p.desc}</div>
      </div>
    `;

    gallery.appendChild(item);
  });

  document.querySelectorAll('.gallery img').forEach(img=>{
    img.onclick = () => openProject(img.dataset.index);
  });
});

// OPEN
function openProject(i){
  const p = projectData[i];
  viewerScroll.innerHTML = '';

  const preloadImages = [];

  p.images.forEach((file, idx)=>{
    const src = p.folder + file;

    // 🔥 PRELOAD
    const preload = new Image();
    preload.src = src;
    preloadImages.push(preload);

    // DISPLAY
    const img = document.createElement('img');
    img.src = src;

    img.onclick = (e)=>{
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (x < rect.width*0.3) prevViewer();
      else if (x > rect.width*0.7) nextViewer();
      else openFullscreen(idx);
    };

    viewerScroll.appendChild(img);
  });

  images = viewerScroll.querySelectorAll('img');
  viewerIndex = 0;
  updateCounter();

  viewer.classList.add('active');
}

// NAV
function nextViewer(){
  viewerIndex = (viewerIndex+1)%images.length;
  images[viewerIndex].scrollIntoView({behavior:"smooth",inline:"center"});
  updateCounter();
}

function prevViewer(){
  viewerIndex = (viewerIndex-1+images.length)%images.length;
  images[viewerIndex].scrollIntoView({behavior:"smooth",inline:"center"});
  updateCounter();
}

function updateCounter(){
  viewerCounter.textContent = `${viewerIndex+1} / ${images.length}`;
}

// FULLSCREEN
function openFullscreen(i){
  currentIndex = i;
  fsImg.src = images[i].src;
  fullscreen.classList.add('active');
}

// FULL NAV
function next(){
  currentIndex=(currentIndex+1)%images.length;
  fsImg.src=images[currentIndex].src;
}

function prev(){
  currentIndex=(currentIndex-1+images.length)%images.length;
  fsImg.src=images[currentIndex].src;
}

// 🖱️ MOUSE WHEEL (NEW)
viewer.addEventListener('wheel', (e)=>{
  if(Math.abs(e.deltaY)>10){
    e.deltaY>0 ? nextViewer() : prevViewer();
  }
});

fullscreen.addEventListener('wheel', (e)=>{
  if(Math.abs(e.deltaY)>10){
    e.deltaY>0 ? next() : prev();
  }
});

// ZONES
viewerLeft.onclick = prevViewer;
viewerRight.onclick = nextViewer;
viewerExit.onclick = ()=> viewer.classList.remove('active');

// CLOSE
fullscreen.onclick = (e)=>{
  if(e.target===fullscreen) fullscreen.classList.remove('active');
};

document.getElementById('fs-close').onclick = ()=>{
  fullscreen.classList.remove('active');
};

document.getElementById('viewer-close').onclick = ()=>{
  viewer.classList.remove('active');
};