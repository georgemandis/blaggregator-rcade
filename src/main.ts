import "./style.css";
import { getInput } from "./input";
import { renderArticleList } from "./views/article-list";
import { renderArticleReader } from "./views/article-reader";
import type { FeedData, ThemeName } from "./types";

// Load feed data — try generated data first, fall back to sample
let feed: FeedData;
try {
  feed = (await import("./data/feed.json")).default as FeedData;
} catch {
  feed = (await import("./data/feed.sample.json")).default as FeedData;
}

const THEMES: ThemeName[] = ["magazine", "newspaper", "terminal"];
const SCROLL_STEP = 20;

// State
let currentView: "list" | "reader" = "list";
let selectedIndex = 0;
let currentTheme: ThemeName = loadTheme();
let readerScrollTop = 0;

// Debounce flags for button presses (prevent repeat on hold)
let aWasPressed = false;
let bWasPressed = false;
let upWasPressed = false;
let downWasPressed = false;

const app = document.querySelector<HTMLDivElement>("#app")!;
applyTheme(currentTheme);

// Initial render
renderCurrentView();

function update() {
  const input = getInput();

  if (currentView === "list") {
    updateList(input);
  } else {
    updateReader(input);
  }

  requestAnimationFrame(update);
}

function updateList(input: ReturnType<typeof getInput>) {
  let needsRender = false;

  // D-pad uses edge detection (one move per press) for list navigation
  const dpadDelta = (input.up && !upWasPressed ? -1 : 0) + (input.down && !downWasPressed ? 1 : 0);
  upWasPressed = input.up;
  downWasPressed = input.down;

  // Spinner delta is naturally accumulated, so it works as-is
  const scrollDelta = dpadDelta + input.spinnerDelta;

  if (scrollDelta !== 0 && feed.posts.length > 0) {
    const newIndex = Math.max(0, Math.min(feed.posts.length - 1, selectedIndex + scrollDelta));
    if (newIndex !== selectedIndex) {
      selectedIndex = newIndex;
      needsRender = true;
    }
  }

  // A button: open article
  if (input.a && !aWasPressed && feed.posts.length > 0) {
    currentView = "reader";
    readerScrollTop = 0;
    app.dataset.postUrl = ""; // Force re-render
    needsRender = true;
  }
  aWasPressed = input.a;

  // B button: cycle theme
  if (input.b && !bWasPressed) {
    const idx = THEMES.indexOf(currentTheme);
    currentTheme = THEMES[(idx + 1) % THEMES.length];
    applyTheme(currentTheme);
    saveTheme(currentTheme);
    needsRender = true;
  }
  bWasPressed = input.b;

  if (needsRender) {
    renderCurrentView();
  }
}

function updateReader(input: ReturnType<typeof getInput>) {
  // Scroll content
  const scrollDelta = (input.up ? -1 : 0) + (input.down ? 1 : 0) + input.spinnerDelta;

  if (scrollDelta !== 0) {
    readerScrollTop = Math.max(0, readerScrollTop + scrollDelta * SCROLL_STEP);
    renderCurrentView();
  }

  // B button: back to list
  if (input.b && !bWasPressed) {
    currentView = "list";
    renderCurrentView();
  }
  bWasPressed = input.b;
}

function renderCurrentView() {
  if (currentView === "list") {
    renderArticleList(app, feed, selectedIndex, currentTheme);
  } else {
    const state = renderArticleReader(app, feed.posts[selectedIndex], readerScrollTop);
    // Clamp scroll position to actual content bounds
    const maxScroll = Math.max(0, state.scrollHeight - state.clientHeight);
    if (readerScrollTop > maxScroll) {
      readerScrollTop = maxScroll;
    }
  }
}

function applyTheme(theme: ThemeName) {
  app.className = `theme-${theme}`;
}

function loadTheme(): ThemeName {
  const saved = localStorage.getItem("blaggregator-theme") as ThemeName | null;
  return saved && THEMES.includes(saved) ? saved : "magazine";
}

function saveTheme(theme: ThemeName) {
  localStorage.setItem("blaggregator-theme", theme);
}

requestAnimationFrame(update);
