// api

const BASE = 'https://hacker-news.firebaseio.com/v0';
const ALGOLIA_API = 'https://hn.algolia.com/api/v1/search_by_date?tags=poll&hitsPerPage=30';
const cache = {};
const seen = new Set();

// comments

const modal = document.getElementById('modal');
const content = document.getElementById('modal-content');

// posts

const PAGE = 15; // how many posts to load per batch
let allIds = [], // all post IDs for current feed
  loaded = 0, // how many posts have been loaded so far
  busy = false, // whether a load is currently in progress
  ready = false, //whether the first page has finished loading
  feed = 'newstories';

const list = document.getElementById('post-list'); // main container for posts
const status = document.getElementById('status'); // status text (loading, error, etc.)
const toast = document.getElementById('toast'); // live update notification