#!/usr/bin/env node
/**
 * Thin CLI over the Notion REST API for /social and /affiliate commands.
 *
 * Why this exists: the Notion MCP server gates several operations behind an
 * enterprise plan, so commands that run unattended (e.g. `/social draft-queue`
 * via headless `claude -e`) need a plan-independent path. This script uses the
 * official `@notionhq/client` SDK with a personal integration secret.
 *
 * Auth: reads NOTION_API_KEY from env. Get one at
 * https://www.notion.so/profile/integrations (create internal integration,
 * connect it to the parent page that contains the target databases).
 *
 * Subcommands (each writes JSON to stdout, logs to stderr, exits non-zero on error):
 *
 *   query --database <id> [--filter <json>] [--max <n>] [--sorts <json>]
 *     List pages in a database. --filter and --sorts use the Notion v1 shapes.
 *
 *   find-by-url --database <id> --url <url> [--url-prop URL]
 *     Convenience wrapper: returns the single page whose URL property equals
 *     <url>, or null. Compares case-sensitively after stripping a trailing slash.
 *
 *   get-page --page <id>
 *     Returns the page object (properties + metadata).
 *
 *   get-page-body --page <id>
 *     Returns { text: "..." } — concatenates all paragraph blocks with blank
 *     lines between them. Use this to read /social draft-queue's drafts.
 *
 *   replace-page-body --page <id> (--content <text> | --content-file <path>)
 *     Wipes all top-level blocks and writes the input as paragraph blocks split
 *     on blank lines. Destructive — overwrites whatever was there.
 *
 *   update-properties --page <id> --properties <json>
 *     Updates properties. Properties JSON uses Notion v1 shapes, e.g.
 *     {"Status": {"select": {"name": "Replied"}}}.
 *
 *   create-page --database <id> --properties <json> [--body-file <path>]
 *     Creates a new page. Body file (if given) becomes paragraph blocks.
 *
 * Examples:
 *   NOTION_API_KEY=secret_... node scripts/notion-cli.mjs \
 *     query --database df2c80d3ac7e4c3a9e0bada5c67fd48a \
 *     --filter '{"property":"Status","select":{"equals":"New"}}' --max 25
 */

import { Client } from "@notionhq/client";
import { readFileSync } from "fs";

const [, , subcommand, ...rest] = process.argv;
const args = parseArgs(rest);

if (!subcommand || subcommand === "--help" || subcommand === "-h") {
  printUsage();
  process.exit(subcommand ? 0 : 1);
}

const NOTION_API_KEY = process.env.NOTION_API_KEY;
if (!NOTION_API_KEY) {
  console.error("error: NOTION_API_KEY env var is required");
  process.exit(2);
}

const client = new Client({ auth: NOTION_API_KEY });

try {
  switch (subcommand) {
    case "query":
      await cmdQuery(args);
      break;
    case "find-by-url":
      await cmdFindByUrl(args);
      break;
    case "get-page":
      await cmdGetPage(args);
      break;
    case "get-page-body":
      await cmdGetPageBody(args);
      break;
    case "replace-page-body":
      await cmdReplacePageBody(args);
      break;
    case "update-properties":
      await cmdUpdateProperties(args);
      break;
    case "create-page":
      await cmdCreatePage(args);
      break;
    default:
      console.error(`unknown subcommand: ${subcommand}`);
      printUsage();
      process.exit(1);
  }
} catch (err) {
  console.error(`error: ${err.message ?? err}`);
  if (err.body) console.error(err.body);
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

function requireArg(args, name) {
  const v = args[name];
  if (v === undefined || v === true) {
    throw new Error(`missing required --${name}`);
  }
  return v;
}

function parseJsonArg(value, label) {
  try {
    return JSON.parse(value);
  } catch (err) {
    throw new Error(`--${label} must be valid JSON: ${err.message}`);
  }
}

async function cmdQuery(args) {
  const database_id = requireArg(args, "database");
  const max = args.max ? Number(args.max) : 100;
  const filter = args.filter ? parseJsonArg(args.filter, "filter") : undefined;
  const sorts = args.sorts ? parseJsonArg(args.sorts, "sorts") : undefined;

  const results = [];
  let cursor;
  while (results.length < max) {
    const remaining = max - results.length;
    const res = await client.databases.query({
      database_id,
      filter,
      sorts,
      start_cursor: cursor,
      page_size: Math.min(100, remaining),
    });
    results.push(...res.results);
    if (!res.has_more || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  process.stdout.write(JSON.stringify(results.slice(0, max), null, 2));
}

async function cmdFindByUrl(args) {
  const database_id = requireArg(args, "database");
  const url = requireArg(args, "url");
  const urlProp = args["url-prop"] ?? "URL";
  const target = stripTrailingSlash(url);

  let cursor;
  while (true) {
    const res = await client.databases.query({
      database_id,
      filter: { property: urlProp, url: { equals: target } },
      page_size: 25,
      start_cursor: cursor,
    });
    for (const page of res.results) {
      const got = page.properties?.[urlProp]?.url;
      if (got && stripTrailingSlash(got) === target) {
        process.stdout.write(JSON.stringify(page, null, 2));
        return;
      }
    }
    if (!res.has_more || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  process.stdout.write("null");
}

async function cmdGetPage(args) {
  const page_id = requireArg(args, "page");
  const page = await client.pages.retrieve({ page_id });
  process.stdout.write(JSON.stringify(page, null, 2));
}

async function cmdGetPageBody(args) {
  const page_id = requireArg(args, "page");
  const text = await readPageText(page_id);
  process.stdout.write(JSON.stringify({ text }, null, 2));
}

async function cmdReplacePageBody(args) {
  const page_id = requireArg(args, "page");
  const content = resolveContent(args);
  const paragraphs = splitParagraphs(content);

  const existing = await listChildBlocks(page_id);
  for (const block of existing) {
    await client.blocks.delete({ block_id: block.id });
  }

  if (paragraphs.length > 0) {
    await client.blocks.children.append({
      block_id: page_id,
      children: paragraphs.map(toParagraphBlock),
    });
  }
  process.stdout.write(JSON.stringify({ ok: true, paragraphs: paragraphs.length }, null, 2));
}

async function cmdUpdateProperties(args) {
  const page_id = requireArg(args, "page");
  const properties = parseJsonArg(requireArg(args, "properties"), "properties");
  const updated = await client.pages.update({ page_id, properties });
  process.stdout.write(JSON.stringify({ ok: true, id: updated.id }, null, 2));
}

async function cmdCreatePage(args) {
  const database_id = requireArg(args, "database");
  const properties = parseJsonArg(requireArg(args, "properties"), "properties");
  const bodyFile = args["body-file"];

  const children = bodyFile
    ? splitParagraphs(readFileSync(bodyFile, "utf8")).map(toParagraphBlock)
    : undefined;

  const page = await client.pages.create({
    parent: { database_id },
    properties,
    ...(children && children.length > 0 ? { children } : {}),
  });
  process.stdout.write(JSON.stringify({ ok: true, id: page.id, url: page.url }, null, 2));
}

async function listChildBlocks(block_id) {
  const out = [];
  let cursor;
  while (true) {
    const res = await client.blocks.children.list({
      block_id,
      start_cursor: cursor,
      page_size: 100,
    });
    out.push(...res.results);
    if (!res.has_more || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  return out;
}

async function readPageText(page_id) {
  const blocks = await listChildBlocks(page_id);
  const parts = [];
  for (const b of blocks) {
    if (b.type === "paragraph") {
      const text = b.paragraph.rich_text.map((t) => t.plain_text).join("");
      parts.push(text);
    }
  }
  return parts.join("\n\n").trim();
}

function resolveContent(args) {
  if (args["content-file"]) return readFileSync(args["content-file"], "utf8");
  if (args.content && args.content !== true) return String(args.content);
  throw new Error("provide --content or --content-file");
}

function splitParagraphs(text) {
  return String(text)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function toParagraphBlock(text) {
  const chunks = chunkRichText(text, 1900);
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: chunks.map((c) => ({ type: "text", text: { content: c } })),
    },
  };
}

function chunkRichText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen));
  }
  return chunks;
}

function stripTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function printUsage() {
  console.error(`Usage:
  NOTION_API_KEY=secret_... node scripts/notion-cli.mjs <subcommand> [args]

Subcommands:
  query --database <id> [--filter <json>] [--sorts <json>] [--max <n>]
  find-by-url --database <id> --url <url> [--url-prop URL]
  get-page --page <id>
  get-page-body --page <id>
  replace-page-body --page <id> (--content <text> | --content-file <path>)
  update-properties --page <id> --properties <json>
  create-page --database <id> --properties <json> [--body-file <path>]

All subcommands write JSON to stdout. Notion property values use the v1 API
shape, e.g. {"Status": {"select": {"name": "Replied"}}}.
`);
}
