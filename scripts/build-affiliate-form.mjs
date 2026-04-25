#!/usr/bin/env node
/**
 * Build and POST (or PATCH) a Tally affiliate-application form from a JSON config.
 *
 * Generalizes the structure verified live in ~/workspaces/zahlhaus's affiliate
 * setup. Handles the post-2026-02 Tally API schema validation quirks:
 *   - each block has its own groupUuid
 *   - input blocks' groupType matches their type (INPUT_TEXT, INPUT_EMAIL, etc.)
 *   - option blocks require isFirst/isLast/index in payload
 *   - CHECKBOX label uses "text", not "html"
 *   - FORM_TITLE accepts logo + cover URLs in payload
 *
 * Prerequisites:
 *   - Tally account with API access (free tier supports the API)
 *   - TALLY_API_KEY env var set
 *
 * Usage:
 *   TALLY_API_KEY=tly-... node scripts/build-affiliate-form.mjs --config <path>
 *   TALLY_API_KEY=tly-... node scripts/build-affiliate-form.mjs --config <path> --patch <form-id>
 *
 * Config file (JSON):
 *   {
 *     "product": {
 *       "name": "Zahlhaus",                          // required
 *       "agreement_url": "https://...",              // required
 *       "premium_tier_label": "Lifetime",            // optional, used in trial-offer question
 *       "logo_url": "https://example.com/logo.svg",  // optional
 *       "cover_url": "https://example.com/cover.png" // optional
 *     },
 *     "form": {
 *       "title": "Zahlhaus Affiliate Application",   // optional, defaults to "{name} Affiliate Application"
 *       "intro_text": "...",                         // optional, default supplied
 *       "include_trial_offer": true,                 // optional, default true
 *       "include_other_channels": true,              // optional, default true
 *       "include_anything_else": true,               // optional, default true
 *       "payout_methods": [                          // optional, default Wise/PayPal/Other
 *         "Wise (preferred, lower fees)",
 *         "PayPal",
 *         "Other (we'll figure it out)"
 *       ]
 *     }
 *   }
 *
 * Outputs the Tally form ID and URL on success. Prints API error body on failure.
 */

import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';

const TALLY_API = 'https://api.tally.so';
const USER_AGENT = 'auto-distribute-affiliate-form/1.0';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = { config: null, patch: null };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--config') parsed.config = args[++i];
    else if (a === '--patch') parsed.patch = args[++i];
    else if (a === '--help' || a === '-h') {
      printUsage();
      process.exit(0);
    } else {
      console.error(`Unknown arg: ${a}`);
      printUsage();
      process.exit(1);
    }
  }
  return parsed;
}

function printUsage() {
  console.error(`Usage:
  TALLY_API_KEY=tly-... node scripts/build-affiliate-form.mjs --config <path> [--patch <form-id>]

  --config <path>    JSON config file describing the form (required)
  --patch <form-id>  Update existing form instead of creating a new one
`);
}

function loadConfig(path) {
  const raw = JSON.parse(readFileSync(path, 'utf-8'));
  const product = raw.product || {};
  if (!product.name) throw new Error('config.product.name is required');
  if (!product.agreement_url) throw new Error('config.product.agreement_url is required');
  const form = raw.form || {};
  return {
    product: {
      name: product.name,
      agreement_url: product.agreement_url,
      premium_tier_label: product.premium_tier_label || 'premium',
      logo_url: product.logo_url || null,
      cover_url: product.cover_url || null,
    },
    form: {
      title: form.title || `${product.name} Affiliate Application`,
      intro_text:
        form.intro_text ||
        `Thanks for your interest in joining the ${product.name} affiliate program. ` +
          `Read the full program terms here: ` +
          `<a href="${product.agreement_url}">${product.name} Affiliate Program</a>. ` +
          `This form takes about 3 minutes.`,
      include_trial_offer: form.include_trial_offer !== false,
      include_other_channels: form.include_other_channels !== false,
      include_anything_else: form.include_anything_else !== false,
      payout_methods:
        form.payout_methods || [
          'Wise (preferred, lower fees)',
          'PayPal',
          "Other (we'll figure it out)",
        ],
    },
  };
}

// ----------------- Block builders ---------------------------------------

function buildBlocks(cfg) {
  const blocks = [];

  // FORM_TITLE with optional logo / cover branding
  const titlePayload = { html: cfg.form.title };
  if (cfg.product.logo_url) titlePayload.logo = cfg.product.logo_url;
  if (cfg.product.cover_url) titlePayload.cover = cfg.product.cover_url;
  blocks.push({
    uuid: randomUUID(),
    type: 'FORM_TITLE',
    groupUuid: randomUUID(),
    groupType: 'FORM_TITLE',
    payload: titlePayload,
  });

  // Intro TEXT (with link to agreement)
  blocks.push({
    uuid: randomUUID(),
    type: 'TEXT',
    groupUuid: randomUUID(),
    groupType: 'TEXT',
    payload: { html: cfg.form.intro_text },
  });

  // Standard input questions
  addQuestion(blocks, 'Name', 'INPUT_TEXT', { placeholder: 'Anja Müller' });
  addQuestion(blocks, "Email (we'll reply here and use this for the welcome email)", 'INPUT_EMAIL', {
    placeholder: 'you@example.com',
  });
  addQuestion(blocks, 'Country (for payout method and tax purposes)', 'INPUT_TEXT', {
    placeholder: 'Germany',
  });
  addQuestion(
    blocks,
    `Primary channel link (the main place you'd talk about ${cfg.product.name})`,
    'INPUT_LINK',
    { placeholder: 'https://youtube.com/@yourchannel' }
  );
  if (cfg.form.include_other_channels) {
    addQuestion(blocks, 'Other channel links (TikTok, Instagram, Substack, podcast, etc.)', 'TEXTAREA', {
      required: false,
      placeholder: 'https://tiktok.com/@you, https://instagram.com/you ...',
    });
  }
  addQuestion(blocks, 'Audience size (rough numbers across your platforms; no minimum)', 'INPUT_TEXT', {
    placeholder: '8k YouTube + 12k TikTok',
  });
  addQuestion(
    blocks,
    `How would you talk about ${cfg.product.name}? (format, frequency, angle)`,
    'TEXTAREA',
    {
      placeholder:
        "I'd integrate it into my B1 listening series, probably one TikTok and one YouTube short...",
    }
  );
  addQuestion(
    blocks,
    "Preferred promo code (3 to 12 chars, letters and numbers, no spaces; we'll use this verbatim if available)",
    'INPUT_TEXT',
    { placeholder: 'ANJA' }
  );

  // Payout method (multiple choice)
  addChoiceQuestion(blocks, 'Payout method', cfg.form.payout_methods, 'MULTIPLE_CHOICE');

  addQuestion(blocks, 'Payout email (the email tied to your Wise or PayPal account)', 'INPUT_EMAIL', {
    placeholder: 'payouts@example.com',
  });

  // Optional trial offer
  if (cfg.form.include_trial_offer) {
    addChoiceQuestion(
      blocks,
      `Want a free ${cfg.product.premium_tier_label} account to try ${cfg.product.name} first?`,
      ['Yes please', "No, I've already tried it"],
      'MULTIPLE_CHOICE'
    );
  }

  // Optional anything-else
  if (cfg.form.include_anything_else) {
    addQuestion(blocks, 'Anything else? (special requests, questions, ideas)', 'TEXTAREA', {
      required: false,
      placeholder: 'Optional',
    });
  }

  // Terms acceptance: TITLE + CHECKBOX (label uses `text`, not `html`)
  blocks.push({
    uuid: randomUUID(),
    type: 'TITLE',
    groupUuid: randomUUID(),
    groupType: 'QUESTION',
    payload: { html: 'Terms acceptance' },
  });
  blocks.push({
    uuid: randomUUID(),
    type: 'CHECKBOX',
    groupUuid: randomUUID(),
    groupType: 'CHECKBOXES',
    payload: {
      text: `I have read and agree to the ${cfg.product.name} Affiliate Program terms (linked at the top of this form).`,
      index: 0,
      isFirst: true,
      isLast: true,
      isRequired: true,
    },
  });

  return blocks;
}

function addQuestion(blocks, titleHtml, inputType, opts = {}) {
  const required = opts.required !== false;
  const placeholder = opts.placeholder || '';
  blocks.push({
    uuid: randomUUID(),
    type: 'TITLE',
    groupUuid: randomUUID(),
    groupType: inputType,
    payload: { html: titleHtml },
  });
  const payload = { isRequired: required };
  if (placeholder) payload.placeholder = placeholder;
  blocks.push({
    uuid: randomUUID(),
    type: inputType,
    groupUuid: randomUUID(),
    groupType: inputType,
    payload,
  });
}

function addChoiceQuestion(blocks, titleHtml, options, choiceType, opts = {}) {
  const required = opts.required !== false;
  blocks.push({
    uuid: randomUUID(),
    type: 'TITLE',
    groupUuid: randomUUID(),
    groupType: 'QUESTION',
    payload: { html: titleHtml },
  });
  const optionsGroup = randomUUID();
  const optionType =
    choiceType === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE_OPTION' : 'DROPDOWN_OPTION';
  const last = options.length - 1;
  options.forEach((opt, index) => {
    blocks.push({
      uuid: randomUUID(),
      type: optionType,
      groupUuid: optionsGroup,
      groupType: choiceType,
      payload: {
        index,
        text: opt,
        isFirst: index === 0,
        isLast: index === last,
        isRequired: index === 0 ? required : false,
      },
    });
  });
}

// ----------------- HTTP -------------------------------------------------

async function callTally(method, path, body, apiKey) {
  const res = await fetch(`${TALLY_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Tally API error ${res.status} on ${method} ${path}:`);
    console.error(text);
    throw new Error(`Tally API ${res.status}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ----------------- Main -------------------------------------------------

async function main() {
  const args = parseArgs();
  if (!args.config) {
    console.error('ERROR: --config <path> is required.');
    printUsage();
    process.exit(1);
  }

  const apiKey = process.env.TALLY_API_KEY;
  if (!apiKey) {
    console.error('ERROR: TALLY_API_KEY env var is required.');
    process.exit(1);
  }

  const cfg = loadConfig(args.config);
  const blocks = buildBlocks(cfg);

  if (args.patch) {
    console.log(`PATCH /forms/${args.patch} (${blocks.length} blocks)`);
    const result = await callTally('PATCH', `/forms/${args.patch}`, { blocks }, apiKey);
    console.log(`Updated form: ${result.id}`);
    console.log(`URL:          https://tally.so/r/${result.id}`);
  } else {
    console.log(`POST /forms (${blocks.length} blocks, status PUBLISHED)`);
    const result = await callTally('POST', '/forms', { status: 'PUBLISHED', blocks }, apiKey);
    console.log(`Created form: ${result.id}`);
    console.log(`URL:          https://tally.so/r/${result.id}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Open the form URL and confirm it looks right.');
    console.log('  2. Tally UI: enable email notifications and configure a redirect.');
    console.log(`  3. Update the agreement page's "Apply" link to https://tally.so/r/${result.id}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
