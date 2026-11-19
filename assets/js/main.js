// Show keyboard focus without leaving a focus ring after mouse or touch use.
document.addEventListener('pointerdown', () => document.body.classList.add('using-pointer'));
document.addEventListener('keydown', event => {
  if (event.key === 'Tab' || event.key.startsWith('Arrow')) document.body.classList.remove('using-pointer');
});

const tabs = [...document.querySelectorAll('.work-tabs [role="tab"]')];
const tabList = document.querySelector('.work-tabs');
function positionTabIndicator(tab) {
  if (!tabList || !tab) return;
  tabList.style.setProperty('--indicator-x', `${tab.offsetLeft}px`);
  tabList.style.setProperty('--indicator-y', `${tab.offsetTop}px`);
  tabList.style.setProperty('--indicator-width', `${tab.offsetWidth}px`);
  tabList.style.setProperty('--indicator-height', `${tab.offsetHeight}px`);
}
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  positionTabIndicator(tab);
  if (focus) tab.focus();
}
if (tabList && tabs.length) {
  const updateIndicator = () => positionTabIndicator(tabs.find(tab => tab.getAttribute('aria-selected') === 'true'));
  updateIndicator();
  tabList.classList.add('has-indicator');
  requestAnimationFrame(() => requestAnimationFrame(() => tabList.classList.add('indicator-ready')));
  window.addEventListener('resize', updateIndicator);
  if (window.ResizeObserver) new ResizeObserver(updateIndicator).observe(tabList);
  if (document.fonts) document.fonts.ready.then(updateIndicator);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabs[next], true);
  });
});
document.querySelectorAll('.presentation-item').forEach(presentation => {
  const slides = [...presentation.querySelectorAll('.presentation-cover')];
  const count = presentation.querySelector('.presentation-count');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentSlide = 0;
  let transitionTimer;

  function finishTransition() {
    clearTimeout(transitionTimer);
    slides.forEach((slide, index) => {
      slide.classList.remove('slide-out-next', 'slide-out-prev', 'slide-in-next', 'slide-in-prev');
      slide.hidden = index !== currentSlide;
      slide.removeAttribute('aria-hidden');
    });
  }

  presentation.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => {
    finishTransition();
    const previousSlide = currentSlide;
    const direction = button.dataset.slide === 'next' ? 'next' : 'prev';
    currentSlide = (currentSlide + (direction === 'next' ? 1 : -1) + slides.length) % slides.length;
    const outgoing = slides[previousSlide];
    const incoming = slides[currentSlide];
    incoming.hidden = false;
    if (reducedMotion.matches) {
      outgoing.hidden = true;
    } else {
      outgoing.setAttribute('aria-hidden', 'true');
      outgoing.classList.add(`slide-out-${direction}`);
      incoming.classList.add(`slide-in-${direction}`);
      transitionTimer = setTimeout(finishTransition, 460);
    }
    count.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }));
});

const presentationDialog = document.querySelector('.presentation-dialog');
if (presentationDialog && typeof presentationDialog.showModal === 'function') {
  const dialogTitle = presentationDialog.querySelector('#dialog-title');
  const dialogStage = presentationDialog.querySelector('.dialog-stage');
  const dialogCount = presentationDialog.querySelector('.dialog-count');
  const closeButton = presentationDialog.querySelector('.dialog-close');
  let dialogSlides = [];
  let dialogIndex = 0;
  let previousBodyOverflow = '';

  function showDialogSlide() {
    const slide = dialogSlides[dialogIndex].cloneNode(true);
    slide.hidden = false;
    slide.removeAttribute('aria-hidden');
    slide.classList.remove('slide-out-next', 'slide-out-prev', 'slide-in-next', 'slide-in-prev');
    const image = slide.querySelector('img');
    if (image) image.loading = 'eager';
    dialogStage.replaceChildren(slide);
    dialogCount.textContent = `${String(dialogIndex + 1).padStart(2, '0')} / ${String(dialogSlides.length).padStart(2, '0')}`;
  }

  function changeDialogSlide(step) {
    dialogIndex = (dialogIndex + step + dialogSlides.length) % dialogSlides.length;
    showDialogSlide();
  }

  document.querySelectorAll('.presentation-item').forEach(presentation => {
    presentation.querySelector('.presentation-open').addEventListener('click', () => {
      dialogSlides = [...presentation.querySelectorAll('.presentation-slides .presentation-cover')];
      dialogIndex = Math.max(0, dialogSlides.findIndex(slide => !slide.hidden && slide.getAttribute('aria-hidden') !== 'true'));
      dialogTitle.textContent = presentation.querySelector('.presentation-info h3').textContent;
      showDialogSlide();
      previousBodyOverflow = document.body.style.overflow;
      presentationDialog.showModal();
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', () => presentationDialog.close());
  presentationDialog.querySelector('.dialog-prev').addEventListener('click', () => changeDialogSlide(-1));
  presentationDialog.querySelector('.dialog-next').addEventListener('click', () => changeDialogSlide(1));
  presentationDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changeDialogSlide(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  presentationDialog.addEventListener('click', event => {
    if (event.target === presentationDialog) presentationDialog.close();
  });
  presentationDialog.addEventListener('close', () => {
    document.body.style.overflow = previousBodyOverflow;
    dialogStage.replaceChildren();
  });
} else {
  document.querySelectorAll('.presentation-open').forEach(button => { button.hidden = true; });
}

function setupWorkGallery(creativeGrid, creativeDialog, imageLabel) {
  if (!creativeGrid) return;
  const creativeTiles = [...creativeGrid.querySelectorAll('.creative-tile')];
  let lastGridWidth = 0;
  function layoutCreativeGrid() {
    const width = creativeGrid.clientWidth;
    if (!width) { lastGridWidth = 0; return; }
    if (width === lastGridWidth) return;
    creativeGrid.classList.add('is-masonry');
    const style = getComputedStyle(creativeGrid);
    const row = parseFloat(style.gridAutoRows);
    const gap = parseFloat(style.columnGap);
    creativeTiles.forEach(tile => {
      const image = tile.querySelector('img');
      const height = tile.getBoundingClientRect().width * Number(image.getAttribute('height')) / Number(image.getAttribute('width'));
      tile.style.gridRowEnd = `span ${Math.ceil((height + gap) / row)}`;
    });
    lastGridWidth = width;
  }
  if (window.ResizeObserver) new ResizeObserver(layoutCreativeGrid).observe(creativeGrid);
  window.addEventListener('resize', layoutCreativeGrid);
  if (tabList) {
    tabList.addEventListener('click', () => requestAnimationFrame(layoutCreativeGrid));
    tabList.addEventListener('keydown', () => requestAnimationFrame(layoutCreativeGrid));
  }
  layoutCreativeGrid();

  if (creativeDialog && typeof creativeDialog.showModal === 'function') {
    const dialogImage = creativeDialog.querySelector('.creative-dialog-image');
    const dialogCount = creativeDialog.querySelector('.creative-count');
    const closeButton = creativeDialog.querySelector('.creative-close');
    let currentCreative = 0;
    let previousOverflow = '';
    function showCreative() {
      const image = creativeTiles[currentCreative].querySelector('img');
      dialogImage.src = image.dataset.fullSrc || image.currentSrc || image.src;
      dialogImage.alt = `${imageLabel} ${currentCreative + 1} из ${creativeTiles.length}`;
      dialogCount.textContent = `${String(currentCreative + 1).padStart(2, '0')} / ${String(creativeTiles.length).padStart(2, '0')}`;
    }
    function moveCreative(step) {
      currentCreative = (currentCreative + step + creativeTiles.length) % creativeTiles.length;
      showCreative();
    }
    creativeTiles.forEach((tile, index) => tile.querySelector('.creative-open').addEventListener('click', () => {
      currentCreative = index;
      showCreative();
      previousOverflow = document.body.style.overflow;
      creativeDialog.showModal();
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }));
    closeButton.addEventListener('click', () => creativeDialog.close());
    creativeDialog.querySelector('.creative-prev').addEventListener('click', () => moveCreative(-1));
    creativeDialog.querySelector('.creative-next').addEventListener('click', () => moveCreative(1));
    creativeDialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        moveCreative(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    creativeDialog.addEventListener('click', event => {
      if (event.target === creativeDialog) creativeDialog.close();
    });
    creativeDialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
  } else {
    creativeGrid.querySelectorAll('.creative-open').forEach(button => { button.disabled = true; });
  }
}

setupWorkGallery(document.querySelector('#panel-branding .creative-grid'), document.querySelector('.creative-dialog'), 'Креатив');
setupWorkGallery(document.querySelector('.branding-grid'), document.querySelector('.branding-dialog'), 'Работа по брендингу');
