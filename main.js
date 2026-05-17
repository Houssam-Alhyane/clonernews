loadFeed('newstories');

// Live updates — notifies every 5s (throttled in api.js)
startLiveUpdates((ids) => // .HN
  showToast(`🔔 new update(s) — click to refresh`, () => loadFeed(feed))
);
