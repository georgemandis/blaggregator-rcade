import { XMLParser } from "fast-xml-parser";
import sanitize from "sanitize-html";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { FeedData, Post } from "../src/types";

const token = process.env.BLAGGREGATOR_TOKEN;
if (!token) {
  console.error("BLAGGREGATOR_TOKEN environment variable is required");
  process.exit(1);
}

const FEED_URL = `https://blaggregator.recurse.com/atom.xml?token=${token}`;

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "pre", "code", "blockquote",
    "em", "strong", "br",
  ],
  allowedAttributes: {},
};

async function fetchFeed(): Promise<void> {
  console.log("Fetching feed...");
  const response = await fetch(FEED_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  console.log("Parsing feed...");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const parsed = parser.parse(xml);

  const entries = parsed.feed?.entry;
  if (!entries) {
    console.log("No entries found in feed");
    const feedData: FeedData = {
      buildDate: new Date().toISOString().split("T")[0],
      postCount: 0,
      posts: [],
    };
    writeFeedData(feedData);
    return;
  }

  const entryList = Array.isArray(entries) ? entries : [entries];

  const posts: Post[] = entryList.map((entry: any) => {
    const title = entry.title || "Untitled";
    const author = entry.author?.name || "Unknown";
    const published = entry.published || "";
    const date = published ? new Date(published).toISOString().split("T")[0] : "";
    const rawSummary = entry.summary || entry.content || "";
    const rawContent = typeof rawSummary === "object" && rawSummary !== null
      ? (rawSummary["#text"] ?? "")
      : String(rawSummary);
    const content = sanitize(rawContent, SANITIZE_OPTIONS);
    const link = Array.isArray(entry.link)
      ? entry.link.find((l: any) => l["@_rel"] === "alternate")?.["@_href"] || ""
      : entry.link?.["@_href"] || "";

    return { title, author, date, content, url: link };
  });

  // Sort by date descending
  posts.sort((a, b) => b.date.localeCompare(a.date));

  const feedData: FeedData = {
    buildDate: new Date().toISOString().split("T")[0],
    postCount: posts.length,
    posts,
  };

  writeFeedData(feedData);
  console.log(`Wrote ${posts.length} posts to feed.json`);
}

function writeFeedData(data: FeedData): void {
  const outDir = join(import.meta.dir, "..", "src", "data");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "feed.json"), JSON.stringify(data, null, 2));
}

fetchFeed().catch((err) => {
  console.error("Failed to fetch feed:", err);
  process.exit(1);
});
