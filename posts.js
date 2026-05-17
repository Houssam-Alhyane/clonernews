const PAGE = 15; // how many posts to load per batch
let allIds = [], // all post IDs for current feed
  loaded = 0, // how many posts have been loaded so far
  busy = false, // whether a load is currently in progress
  ready = false, //whether the first page has finished loading
  feed = 'newstories';

const list = document.getElementById('post-list'); // main container for posts
const status = document.getElementById('status'); // status text (loading, error, etc.)
const toast = document.getElementById('toast'); // live update notification

//creat bade Jobs Polls
const typeBadge = (t) =>
  `<span class="post-badge badge-${t}">${
    t[0].toUpperCase() + t.slice(1)
  }</span>`;

//change from obj to html
function renderPost(item) {
  const type =
    item.type === 'job' ? 'job' : item.type === 'poll' ? 'poll' : 'story';
  const url = item.url || `https://news.ycombinator.com/item?id=${item.id}`;
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.id = item.id;
  //title and contant
  card.innerHTML = `
    ${typeBadge(type)}<a class="post-title" href="${url}" target="_blank">${
    item.title || '(no title)'
  }</a>
    <div class="post-meta">
      <span>👤 ${item.by || '?'}</span> <span>🕐 ${timeAgo(item.time)}</span>
      ${item.score != null ? `<span>▲ ${item.score}</span>` : ''} 
    </div>
    ${
      type === 'poll' && item.parts
        ? `<div class="poll-options" id="p${item.id}"></div>`
        : ''
    }
    ${
      item.descendants
        ? `<button class="comment-btn" data-id="${item.id}">💬 Comments (${item.descendants})</button>`
        : ''
    }`;
  if (type === 'poll' && item.parts) loadPoll(item.parts, `p${item.id}`); // load poll options asynchronously
  return card;
}
//fetch poll options for one post
async function loadPoll(parts, id) {
  //all part of polls
  const items = await HN.fetchItems(parts);
  const el = document.getElementById(id);
  if (el)
    el.innerHTML = items
      .map(
        (p) =>
          `<div class="poll-option"><span>${p.text || '?'}</span><span>▲${
            p.score || 0
          }</span></div>`
      )
      .join('');
}
//loadFeed = reset + fetch new dataset
async function loadFeed(f) {
  feed = f;
  allIds = [];
  loaded = 0;
  busy = false;
  ready = false;
  list.innerHTML = '';
  status.textContent = 'Loading…';
  try {
    allIds = (await HN.fetchFeedIds(f)) || [];
    allIds.sort((a, b) => b - a);
    if (!allIds.length) {
      status.textContent = 'No posts found.';
      return;
    }
    status.textContent = '';
    await loadPage();
    ready = true;
  } catch (e) {
    status.textContent = 'Error loading feed. Try again.';
    busy = false;
  }
}
//upload fildes in page
async function loadPage() {
  if (busy || loaded >= allIds.length) return;
  busy = true;
  status.textContent = 'Loading…';
  try {
    const slice = allIds.slice(loaded, loaded + PAGE);
    const items = await HN.fetchItems(slice);
    items.sort((a, b) => b.time - a.time);
    items.forEach((i) => list.append(renderPost(i)));
    loaded += slice.length;
    const done = loaded >= allIds.length;
    status.textContent = done ? 'All posts loaded.' : '';
  } catch (e) {
    status.textContent = 'Error loading posts. Try again.';
  } finally {
    busy = false;
  }
}

function showToast(msg, cb) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.onclick = () => {
    toast.classList.add('hidden');
    cb && cb();
  };
  setTimeout(() => toast.classList.add('hidden'), 8000);
}

// Live updates — notifies every 5s (throttled in api.js)
HN.startLiveUpdates((ids) =>
  showToast(`🔔 new update(s) — click to refresh`, () => loadFeed(feed))
);

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

loadFeed('newstories');
