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
      ${item.score != null ? `<span>▲ ${item.score}</span>` : ''} ${
    item.descendants != null ? `<span>💬 ${item.descendants}</span>` : ''
  }
    </div>
    ${
      type === 'poll' && item.parts
        ? `<div class="poll-options" id="p${item.id}"></div>`
        : ''
    }
    ${
      item.kids?.length
        ? `<button class="comment-btn" data-id="${item.id}">💬 Comments (${item.kids.length})</button>`
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
