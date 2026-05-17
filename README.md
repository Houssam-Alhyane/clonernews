# Hacker News Reader

A lightweight, modern web client for browsing Hacker News stories, jobs, polls, and comments.

## Authors

- **@thakkou**
- **@halhyane**
- **@ouaaitalla**

---

## Features

### 📰 Multiple Feed Types

- **Stories** - Latest news and discussions
- **Jobs** - Tech job postings
- **Polls** - Community polls with live voting results

### 💬 Comment System

- Modal-based comment viewer
- Nested comment threads
- Real-time comment loading
- Batch loading (20 comments at a time)
- Time-stamped "time ago" formatting

### 🔄 Live Updates

- Auto-refresh notifications every 5 seconds
- Toast notifications for new content
- One-click refresh to latest posts

### ⚡ Performance Optimizations

- Client-side caching for API responses
- Infinite scroll pagination (15 posts per page)
- Lazy loading of poll options
- Batched API requests (20 items per batch)

### 🎨 UI/UX

- Clean, card-based post layout
- Type badges (Story, Job, Poll)
- Clickable external links
- Score and comment count display
- Responsive design with smooth scrolling

---

## Architecture

### Core Modules

#### `api.js` - Data fetching & caching

- Firebase API integration
- Algolia search for polls
- Item caching system
- Live update polling

#### `posts.js` - Feed rendering

- Post card generation
- Feed switching (stories/jobs/polls)
- Infinite scroll handler
- Poll option loading

#### `comments.js` - Comment modal

- Comment thread rendering
- Batch comment loading
- Parent post tracking
- HTML sanitization

#### `main.js` - App initialization

- Event delegation
- Tab switching
- Live update notifications

---

## API Integration

### Hacker News Firebase API

```
Base URL: https://hacker-news.firebaseio.com/v0
```

**Endpoints used:**

- `/{feedType}.json` - Get feed item IDs
- `/item/{id}.json` - Get individual item details
- `/updates.json` - Poll for new content

### Algolia Search API (for polls)

```
https://hn.algolia.com/api/v1/search_by_date?tags=poll&hitsPerPage=30
```

---

## Key Functions

### Data Fetching

| Function                     | Description                               |
| ---------------------------- | ----------------------------------------- |
| `fetchItem(id)`              | Get single item with caching              |
| `fetchItems(ids)`            | Batch fetch multiple items (20 at a time) |
| `fetchFeedIds(feed)`         | Get feed item IDs                         |
| `startLiveUpdates(callback)` | Poll for new content every 5s             |

### Rendering

| Function                       | Description                      |
| ------------------------------ | -------------------------------- |
| `renderPost(item)`             | Generate post card HTML          |
| `makeComment(comment, postId)` | Generate comment HTML            |
| `loadPoll(parts, id)`          | Load poll options asynchronously |
| `openComments(postId)`         | Open comment modal for a post    |

### Utilities

| Function                       | Description                                                        |
| ------------------------------ | ------------------------------------------------------------------ |
| `timeAgo(unixTime)`            | Convert Unix timestamp to human-readable format (e.g., "2h", "5m") |
| `sanitize(html)`               | XSS protection for user-generated content                          |
| `showToast(message, callback)` | Display notification toast                                         |

---

## Configuration Constants

```javascript
const PAGE = 15; // Posts per pagination batch
const POLL_INTERVAL = 5000; // Live update frequency (ms)
const COMMENT_BATCH = 20; // Comments loaded per click
```

---

## Data Flow

```
1. User selects feed (Stories/Jobs/Polls)
   ↓
2. fetchFeedIds() retrieves item IDs from HN API
   ↓
3. fetchItems() loads first PAGE items (15)
   ↓
4. renderPost() creates HTML cards
   ↓
5. Infinite scroll triggers loadPage() for more
   ↓
6. startLiveUpdates() polls for new content every 5s
```

### Comment Flow

```
1. User clicks "💬 Comments" button
   ↓
2. openComments() fetches post details
   ↓
3. loadBatch() fetches first 20 comments (sorted newest first)
   ↓
4. makeComment() renders each comment
   ↓
5. "Load more" button fetches next batch
```

---

## Security Features

- **XSS Protection**: `sanitize()` function removes dangerous tags
- **Stripped Elements**: `<script>`, `<iframe>`, `<object>`
- **External Links**: All links use `rel="noopener"` for security
- **No Write Operations**: Read-only client (no voting/posting)

---

## Browser Compatibility

Requires modern JavaScript features:

- ✅ `async/await`
- ✅ `fetch` API
- ✅ `IntersectionObserver` (for infinite scroll)
- ✅ `dataset` attributes
- ✅ ES6 arrow functions
- ✅ Template literals

**Recommended Browsers:**

- Chrome/Edge 55+
- Firefox 52+
- Safari 11+

---

## File Structure

```
project/
├── index.html          # Main HTML structure
├── styles.css          # Styling
├── api.js             # API & caching logic
├── posts.js           # Post rendering & feeds
├── comments.js        # Comment modal logic
├── main.js            # App initialization
└── README.md          # This file
```

---

## Usage

### Installation

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### Navigation

- **Tabs**: Click "Stories", "Jobs", or "Polls" to switch feeds
- **Comments**: Click "💬 Comments" on any post to view discussion
- **External Links**: Click post titles to visit original sources
- **Load More**: Scroll to bottom for infinite pagination
- **Live Updates**: Click toast notification to refresh feed

---

## Technical Highlights

### Efficient Caching

```javascript
const cache = {}; // In-memory item cache
if (cache[id]) return cache[id]; // Instant retrieval
```

### Batch Processing

```javascript
// Load 20 items concurrently instead of sequentially
for (let i = 0; i < ids.length; i += 20) {
  const res = await Promise.all(ids.slice(i, i + 20).map(fetchItem));
}
```

### Smart Sorting

```javascript
// Comments: Sort by ID descending (higher ID = newer)
const kids = [...post.kids].sort((a, b) => b - a);

// Posts: Sort by timestamp descending
items.sort((a, b) => b.time - a.time);
```

---

## Known Limitations

- **No Authentication**: Cannot vote, post, or comment
- **Read-Only**: All operations are GET requests
- **No Offline Mode**: Requires internet connection
- **Poll Endpoint**: Uses Algolia search (no official HN poll feed)

---

## Future Enhancements

- [ ] Add search functionality
- [ ] Implement dark mode
- [ ] Add keyboard shortcuts
- [ ] Save favorites to localStorage
- [ ] Add filter by score/comments
- [ ] Implement comment collapsing
- [ ] Add "Back to Top" button

---

## Contributing

Feel free to fork, modify, and submit pull requests!

---

## License

Open source - free to use and modify.

---

## Acknowledgments

- **Hacker News API**: [Firebase API Documentation](https://github.com/HackerNews/API)
- **Algolia HN Search**: [Algolia HN API](https://hn.algolia.com/api)

---

**Built  by @thakkou, @halhyane, and @ouaaitalla**
