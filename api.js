// api.js — fetch, cache, live updates

// Shared helpers used by posts.js and comments.js
const timeAgo = (u) => {
  const s = (Date.now() / 1000 - u) | 0;
  return s < 60 ?
    s + 's' :
    s < 3600 ?
      ((s / 60) | 0) + 'm' :
      s < 86400 ?
        ((s / 3600) | 0) + 'h' :
        ((s / 86400) | 0) + 'd';
};

//
const sanitize = (h) => {
  const div = document.createElement('div');
  div.innerHTML = h;
  div.querySelectorAll('script,iframe,object').forEach((e) => e.remove());
  return div.innerHTML;
};

//
const get = (url) => fetch(url)
  .then(r => r.json())
  .catch(() => null);

//
async function fetchItem(id) {
  if (cache[id]) return cache[id];
  const item = await get(`${BASE}/item/${id}.json`);
  if (item) cache[id] = item;
  return item;
}

//
async function fetchItems(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 20) {
    const res = await Promise.all(ids.slice(i, i + 20).map(fetchItem));
    out.push(...res.filter(Boolean));
  }
  return out;
}

//
async function fetchFeedIds(feed) {
  if (feed !== 'pollstories')
    return (await get(`${BASE}/${feed}.json`)) || [];
  // Use Algolia HN Search API to find recent polls — no official HN poll endpoint exists
  const d = await get(ALGOLIA_API);
  if (!d || !d.hits) return [];
  return d.hits.map((h) => parseInt(h.objectID)).filter(Boolean);
}

//
function startLiveUpdates(cb) {
  async function poll(first) {
    const d = await get(`${BASE}/updates.json`);
    if (!d?.items) return;
    if (first) {
      d.items.forEach((id) => seen.add(id));
      return;
    } // seed silently
    const newIds = d.items.filter((id) => !seen.has(id));
    if (newIds.length) {
      newIds.forEach((id) => seen.add(id));
      cb(newIds);
    }
  }
  poll(true);
  setInterval(() => poll(false), 5000); // throttled: every 5s
}
