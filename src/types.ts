export interface Post {
  title: string;
  author: string;
  date: string;
  content: string;
  url: string;
}

export interface FeedData {
  buildDate: string;
  postCount: number;
  posts: Post[];
}

export type ThemeName = "magazine" | "newspaper" | "terminal";

export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
