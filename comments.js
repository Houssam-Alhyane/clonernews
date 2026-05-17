// comments.js — comment modal

async function openComments(postId) {
  modal.classList.remove('hidden');
  content.innerHTML = '<p>Loading…</p>';

  const post = await fetchItem(postId); // HN.

  if (!post) {
    content.innerHTML = '<p>Failed to load.</p>';
    return;
  }

  const url = post.url || `https://news.ycombinator.com/item?id=${post.id}`;

  content.innerHTML = `
    <div class="modal-title">
      <a href="${url}" target="_blank" rel="noopener">
        ${post.title || '(no title)'}
      </a>
    </div>

    <div class="modal-meta">
      by ${post.by || '?'} · ${post.descendants || 0} comments · parent #${postId}</div>
    </div>
    <div id="cr"></div>
  `;

  const root = document.getElementById('cr');

  if (!post.kids?.length) {
    root.innerHTML = '<p style="color:#888">No comments yet.</p>';
    return;
  }

  // Sort kids by ID descending (higher ID = newer), load in batches of 20
  const kids = [...post.kids].sort((a, b) => b - a);

  loadBatch(kids, 0, root, postId);
}

async function loadBatch(kids, offset, container, postId) {
  const slice = kids.slice(offset, offset + 20);

  const items = await fetchItems(slice); // HN.

  items.sort((a, b) => b.time - a.time); // newest → oldest

  items.forEach((c) => {
    const el = makeComment(c, postId);

    if (el) {
      container.appendChild(el);
    }
  });

  container.querySelector('.lmc')?.remove();

  const next = offset + slice.length;

  if (next < kids.length) {
    const btn = document.createElement('button');

    btn.className = 'comment-btn lmc';
    btn.textContent = `Load more (${kids.length - next} left)`;

    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'Loading…';

      loadBatch(kids, next, container, postId);
    });

    container.appendChild(btn);
  }
}

function makeComment(c, postId) {
  if (!c || c.deleted || c.dead) return null;

  const div = document.createElement('div');

  div.className = 'comment-item';

  div.dataset.parent = postId; // associates comment with its parent post

  div.innerHTML = `
    <div class="comment-meta">
      👤 ${c.by || '[deleted]'} · ${
    c.time ? timeAgo(c.time) : ''
  } · post #${postId}
    </div>

    <div class="comment-text">
      ${sanitize(c.text || '<em>(no text)</em>')}
    </div>
  `;

  return div;
}