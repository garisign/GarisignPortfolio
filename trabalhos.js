const filterButtons = document.querySelectorAll('[data-filter]');
const workGrid = document.querySelector('.works-grid');
const emptyState = document.querySelector('.works-empty-state');

function applyFilter(category) {
  filterButtons.forEach(item => item.classList.toggle('active', item.getAttribute('data-filter') === category));

  if (!workGrid) return;
  const cards = Array.from(workGrid.children);
  let visibleCount = 0;

  cards.forEach(card => {
    const categories = card.dataset.categories ? card.dataset.categories.split(',') : [];
    const matches = category === 'all' || categories.includes(category);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount += 1;
  });

  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    emptyState.setAttribute('aria-hidden', String(visibleCount > 0));
  }
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => applyFilter(btn.getAttribute('data-filter')));
});

applyFilter('all');
