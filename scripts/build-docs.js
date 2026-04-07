import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const configPath = path.join(rootDir, ".github", "docs-site.config.json");
const outputDir = path.join(rootDir, "docs");
const outputPath = path.join(outputDir, "index.html");

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const extractHeadings = (markdown) => {
  const tokens = marked.lexer(markdown);
  return tokens
    .filter((token) => token.type === "heading" && token.depth <= 3)
    .map((token) => ({
      depth: token.depth,
      text: token.text,
      id: slugify(token.text),
    }));
};

const buildHtml = ({ title, heroText, sourceLabel, content, toc }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      :root {
        --bg-1: #f7f3ea;
        --bg-2: #dfe8f6;
        --card: #ffffffcc;
        --text: #17202a;
        --muted: #4f5f6f;
        --accent: #0f766e;
        --line: #d6dee6;
        --shadow: 0 12px 30px rgba(16, 24, 40, 0.12);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        color: var(--text);
        background:
          radial-gradient(circle at 20% 10%, #fff6d9 0, transparent 40%),
          radial-gradient(circle at 80% 20%, #d9efff 0, transparent 30%),
          linear-gradient(170deg, var(--bg-1), var(--bg-2));
        font-family: "Trebuchet MS", "Segoe UI", sans-serif;
        line-height: 1.7;
      }

      .wrap {
        max-width: 1120px;
        margin: 0 auto;
        padding: 24px 16px 56px;
      }

      .hero {
        background: linear-gradient(120deg, #0f766e, #0f4c81 70%, #0b7285);
        color: #f5fbff;
        border-radius: 18px;
        box-shadow: var(--shadow);
        padding: 28px;
        margin-bottom: 16px;
      }

      .hero h1 {
        margin: 0 0 6px;
        font-size: clamp(1.4rem, 3vw, 2.3rem);
      }

      .hero p {
        margin: 0;
        opacity: 0.95;
      }

      .layout {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 16px;
      }

      .card {
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 14px;
        box-shadow: var(--shadow);
        backdrop-filter: blur(6px);
      }

      .toc {
        position: sticky;
        top: 14px;
        align-self: start;
        padding: 14px;
        max-height: calc(100vh - 28px);
        overflow: auto;
      }

      .toc h2 {
        margin: 0 0 10px;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }

      .toc a {
        display: block;
        text-decoration: none;
        color: var(--text);
        border-radius: 8px;
        padding: 6px 8px;
        margin-bottom: 4px;
      }

      .toc a[data-depth="2"] { margin-left: 10px; }
      .toc a[data-depth="3"] { margin-left: 20px; }

      .toc a:hover {
        background: #edf5ff;
      }

      .doc {
        padding: 18px;
        background: #fff;
      }

      .doc h1, .doc h2, .doc h3 {
        scroll-margin-top: 16px;
      }

      .doc h1 { font-size: 1.8rem; }
      .doc h2 {
        margin-top: 2rem;
        border-bottom: 1px solid #e7edf4;
        padding-bottom: 0.35rem;
      }

      .doc code {
        background: #f3f6fb;
        border: 1px solid #e0e8f1;
        border-radius: 6px;
        padding: 2px 6px;
      }

      .doc pre {
        margin: 10px 0;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        overflow-x: auto;
      }

      .doc pre code {
        background: transparent;
        border: 0;
        padding: 0;
      }

      .doc blockquote {
        border-left: 4px solid #8fb3cf;
        margin: 1rem 0;
        padding: 0.1rem 0.9rem;
        background: #f7fbff;
      }

      .doc table {
        width: 100%;
        border-collapse: collapse;
      }

      .doc th,
      .doc td {
        border: 1px solid #d8e2ec;
        padding: 8px;
        text-align: left;
      }

      .footer {
        margin-top: 14px;
        color: var(--muted);
        font-size: 0.9rem;
      }

      @media (max-width: 900px) {
        .layout { grid-template-columns: 1fr; }
        .toc {
          position: static;
          max-height: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <header class="hero">
        <h1>${title}</h1>
        <p>${heroText}</p>
      </header>

      <main class="layout">
        <aside class="card toc">
          <h2>Contents</h2>
          ${toc}
        </aside>

        <article class="card doc">
          ${content}
          <p class="footer">Source: ${sourceLabel}</p>
        </article>
      </main>
    </div>
  </body>
</html>`;

const run = async () => {
  let config;
  try {
    const rawConfig = await fs.readFile(configPath, "utf8");
    config = JSON.parse(rawConfig);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(
        `Missing docs config: ${configPath}.`
      );
    }
    throw error;
  }

  const markdownPath = path.join(rootDir, config.sourceMarkdown || "docs/API_REFERENCE.md");
  let markdown;
  try {
    markdown = await fs.readFile(markdownPath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(`Missing markdown source for docs site: ${markdownPath}.`);
    }
    throw error;
  }

  const renderer = new marked.Renderer();
  renderer.heading = (token) => {
    const level = token.depth;
    const text = token.text;
    const id = slugify(text);
    return `<h${level} id="${id}">${text}</h${level}>`;
  };

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });

  const tocItems = extractHeadings(markdown)
    .map(
      (heading) =>
        `<a href="#${heading.id}" data-depth="${heading.depth}">${heading.text}</a>`
    )
    .join("\n");

  const content = marked.parse(markdown);
  const html = buildHtml({
    title: config.title || "Project Documentation",
    heroText:
      config.heroText ||
      "This page is automatically generated from a predefined markdown source.",
    sourceLabel: config.sourceMarkdown || "docs/API_REFERENCE.md",
    content,
    toc: tocItems,
  });

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");
  console.log(
    `Generated ${path.relative(rootDir, outputPath)} from ${path.relative(rootDir, markdownPath)}`
  );
};

run().catch((error) => {
  console.error("Failed to build docs:", error);
  process.exit(1);
});
