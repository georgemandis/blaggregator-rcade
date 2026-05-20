import { escapeHtml, type FeedData, type ThemeName } from "../types";

const THEME_TITLES: Record<ThemeName, string> = {
  magazine: "Blaggregator",
  newspaper: "THE RECURSE REVIEW",
  terminal: "blaggregator",
};

export function renderArticleList(
  container: HTMLElement,
  feed: FeedData,
  selectedIndex: number,
  theme: ThemeName,
): void {
  const header = document.createElement("div");
  header.className = "header";
  header.innerHTML = `
    <div class="edition-title">${THEME_TITLES[theme]}</div>
    <div class="edition-meta">${feed.buildDate} &bull; ${feed.postCount} posts</div>
  `;

  const content = document.createElement("div");
  content.className = "content";

  if (feed.posts.length === 0) {
    content.innerHTML = `<div class="empty-state">No posts today. Check back tomorrow!</div>`;
  } else {
    const list = document.createElement("div");
    list.className = "article-list";

    feed.posts.forEach((post, i) => {
      const item = document.createElement("div");
      item.className = `article-item${i === selectedIndex ? " selected" : ""}`;
      item.innerHTML = `
        <div class="title">${escapeHtml(post.title)}</div>
        <div class="meta">${escapeHtml(post.author)} &bull; ${post.date}</div>
      `;
      list.appendChild(item);
    });

    content.appendChild(list);
  }

  const footer = document.createElement("div");
  footer.className = "footer";
  footer.textContent = "SPIN/DPAD scroll | A read | B theme";

  container.innerHTML = "";
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);

  // Scroll selected item into view within the overflow-y: auto container
  const selectedEl = content.querySelector(".article-item.selected");
  if (selectedEl) {
    const contentRect = content.getBoundingClientRect();
    const itemRect = selectedEl.getBoundingClientRect();
    if (itemRect.bottom > contentRect.bottom || itemRect.top < contentRect.top) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }
}
