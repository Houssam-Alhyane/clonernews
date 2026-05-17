// comments

document
  .getElementById('modal-close')
  .addEventListener('click', () => {
    modal.classList.add('hidden');
  });

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

// posts

// Tab switch
document.querySelectorAll('.tab').forEach((btn) =>
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.tab')
      .forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    loadFeed(btn.dataset.feed);
  })
);

// Comment button (delegation)
list.addEventListener('click', (e) => {
  const btn = e.target.closest('.comment-btn');
  if (btn) openComments(+btn.dataset.id);
});

// IntersectionObserver — only fires after first page ready
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const fullHeight = document.body.offsetHeight;
  if (ready && scrollTop + windowHeight >= fullHeight - 200) {
    loadPage();
  }
});