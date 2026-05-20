import { escapeHtml, type Post } from "../types";

export interface ReaderState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export function renderArticleReader(
  container: HTMLElement,
  post: Post,
  scrollTop: number,
): ReaderState {
  // Only re-render if article changed
  if (!container.querySelector(".reader-header") || container.dataset.postUrl !== post.url) {
    container.dataset.postUrl = post.url;

    const header = document.createElement("div");
    header.className = "reader-header";
    header.innerHTML = `
      <div class="title">${escapeHtml(post.title)}</div>
      <div class="meta">${escapeHtml(post.author)} &bull; ${post.date}</div>
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "content";

    const body = document.createElement("div");
    body.className = "article-body";
    body.innerHTML = post.content;
    wrapper.appendChild(body);

    const indicator = document.createElement("div");
    indicator.className = "scroll-indicator";
    indicator.innerHTML = `<div class="thumb"></div>`;
    wrapper.appendChild(indicator);

    const footer = document.createElement("div");
    footer.className = "footer";
    footer.textContent = "SPIN/DPAD scroll | B back";

    container.innerHTML = "";
    container.appendChild(header);
    container.appendChild(wrapper);
    container.appendChild(footer);
  }

  // Apply scroll position
  const body = container.querySelector<HTMLElement>(".article-body")!;
  body.scrollTop = scrollTop;

  // Update scroll indicator
  const scrollHeight = body.scrollHeight;
  const clientHeight = body.clientHeight;
  const thumb = container.querySelector<HTMLElement>(".scroll-indicator .thumb")!;

  if (scrollHeight <= clientHeight) {
    thumb.style.display = "none";
  } else {
    thumb.style.display = "block";
    const thumbHeight = Math.max(8, (clientHeight / scrollHeight) * clientHeight);
    const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${thumbTop}px`;
  }

  return { scrollTop: body.scrollTop, scrollHeight, clientHeight };
}
