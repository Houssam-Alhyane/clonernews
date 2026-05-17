// Posts

// creates bade Jobs Polls
const typeBadge = (t) =>
  `<span class="post-badge badge-${t}">${
    t[0].toUpperCase() + t.slice(1)
  }</span>`;

function getType(item) {
  if (item.type === 'job') return 'job';
  if (item.type === 'poll') return 'poll';
  return 'story';
}

// change from obj to html
function renderPost(item) {
  const type = getType(item);
  const url = item.url || `https://news.ycombinator.com/item?id=${item.id}`;
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.id = item.id;
  //title and contant
  console.log(type);
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

// fetch poll options for one post
async function loadPoll(parts, id) {
  //all part of polls
  const items = await fetchItems(parts); // HN.
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

// loadFeed = reset + fetch new dataset
async function loadFeed(f) {
  feed = f;
  allIds = [];
  loaded = 0;
  busy = false;
  ready = false;
  list.innerHTML = '';
  status.textContent = 'Loading…';
  try {
    allIds = (await fetchFeedIds(f)) || []; // HN.
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

// upload fildes in page
async function loadPage() {
  if (busy || loaded >= allIds.length) return;
  busy = true;
  status.textContent = 'Loading…';
  try {
    const slice = allIds.slice(loaded, loaded + PAGE);
    const items = await fetchItems(slice); // HN.
    items.sort((a, b) => b.time - a.time);
    // filter items by feed type so polls don't appear in stories, etc.
    const filtered = items.filter((i) => {
      const type = getType(i);
      if (feed === 'newstories')
        return type === 'story' || type === 'ask' || type === 'show';
      if (feed === 'jobstories') return type === 'job';
      if (feed === 'pollstories') return type === 'poll';
      return true;
    });
    filtered.forEach((i) => list.append(renderPost(i)));
    loaded += slice.length;
    const done = loaded >= allIds.length;
    status.textContent = done ? 'All posts loaded.' : '';
  } catch (e) {
    status.textContent = 'Error loading posts. Try again.';
  } finally {
    busy = false;
  }
}

//
function showToast(msg, cb) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.onclick = () => {
    toast.classList.add('hidden');
    cb && cb();
  };
  setTimeout(() => toast.classList.add('hidden'), 8000);
}