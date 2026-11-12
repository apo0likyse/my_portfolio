const tabs = [...document.querySelectorAll('.work-tabs [role="tab"]')];
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
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
const slides = [...document.querySelectorAll('.presentation-item')];
let currentSlide = 0;
document.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => {
  currentSlide = (currentSlide + (button.dataset.slide === 'next' ? 1 : -1) + slides.length) % slides.length;
  slides.forEach((slide, index) => { slide.hidden = index !== currentSlide; });
  document.getElementById('presentation-count').textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
}));
