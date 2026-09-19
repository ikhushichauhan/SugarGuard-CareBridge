// ═══════════════════════════════════════════════════════════════════════
// SugarGuard CareBridge — OCR Test Mapper (extraction only)
// ═══════════════════════════════════════════════════════════════════════
//
// Takes raw OCR text and finds, at most, ONE supported test name + a
// nearby numeric value + its unit. This module does NOT interpret the
// value in any way (no "normal"/"prediabetes"/"diabetes" labels) - that
// stays the exclusive job of `labRanges.js`. This file only answers the
// question "which of our 4 supported tests does this text mention, and
// what number/unit is written next to it?"
//
// Deliberately conservative: if it isn't confident, it returns null for
// that field rather than guessing, so the UI can ask the user to review
// or fill in manually rather than silently populating a wrong value.

import { LAB_TEST_IDS } from "./labRanges.js";

// Each supported test maps to a list of name variants as they commonly
// appear on Indian lab reports, including common OCR artifact variations.
const TEST_NAME_PATTERNS = [
  {
    // [1lI] tolerates common OCR misreads of "1" as lowercase "l" or
    // uppercase "I" in "HbA1c", as well as appended OCR trailing digits (e.g. "HbA1c1").
    id: LAB_TEST_IDS.HBA1C,
    unit: "%",
    patterns: [
      /(?:hb\s*a|hba)[1lI]c[1lI\d]?\b/i,
      /glycated\s*h(a)?emoglobin/i,
      /glycohemoglobin/i,
      /hb\s*a1c/i,
    ],
  },
  {
    id: LAB_TEST_IDS.FPG,
    unit: "mg/dL",
    patterns: [
      /\bfasting\s*(blood\s*)?(glucose|sugar)\b/i,
      /\bfpg\b/i,
      /\bfbs\b/i,
      /glucose\s*\(?\s*fasting\s*\)?/i,
    ],
  },
  {
    id: LAB_TEST_IDS.RBG,
    unit: "mg/dL",
    patterns: [
      /\brandom\s*(blood\s*)?(glucose|sugar)\b/i,
      /\brbs\b/i,
      /\brbg\b/i,
      /glucose\s*\(?\s*random\s*\)?/i,
    ],
  },
  {
    id: LAB_TEST_IDS.OGTT,
    unit: "mg/dL",
    patterns: [
      /2[\s-]*(hour|hr)[s]?\s*(ogtt|oral\s*glucose\s*tolerance|post\s*prandial|pp)?\s*(glucose|sugar)?\b/i,
      /\bogtt\b/i,
      /oral\s*glucose\s*tolerance\s*test/i,
      /post\s*prandial\s*(blood\s*)?(glucose|sugar)/i,
      /2[\s-]*h[rs]?\s*post\s*glucose/i,
    ],
  },
];

// Matches a numeric value (int or float) optionally followed by unit
const VALUE_PATTERN = /(\d{1,3}(?:\.\d{1,2})?)\s*(%|mg\s*\/?\s*d[lI1]|mmol\s*\/?\s*l)?/i;

/**
 * @param {string} rawText - raw text returned by the OCR engine
 * @returns {{
 *   matches: Array<{testId: string, value: number, unit: string, sourceLine: string}>,
 *   unmatchedLines: string[]
 * }}
 */
export function extractLabCandidates(rawText) {
  const lines = (rawText || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const matches = [];
  const unmatchedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matchedThisLine = false;

    for (const test of TEST_NAME_PATTERNS) {
      // Find the first matching pattern for this test on the line
      let bestMatch = null;
      for (const pattern of test.patterns) {
        const m = line.match(pattern);
        if (m) {
          bestMatch = m;
          break;
        }
      }

      if (!bestMatch) continue;

      // Extract text strictly AFTER the matched test name to avoid matching
      // digits inside the test name itself (e.g. '1' in 'HbA1c', '2' in '2-Hour OGTT')
      const afterText = line.slice(bestMatch.index + bestMatch[0].length);

      let valueHit = afterText.match(VALUE_PATTERN);
      let sourceLine = line;

      // If no value found on the same line after test name, check the immediate next line
      if (!valueHit && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const nextHit = nextLine.match(VALUE_PATTERN);
        if (nextHit) {
          valueHit = nextHit;
          sourceLine = `${line} | ${nextLine}`;
        }
      }

      if (!valueHit) continue;

      const numeric = Number(valueHit[1]);
      if (!Number.isFinite(numeric) || numeric <= 0) continue;

      matches.push({
        testId: test.id,
        value: numeric,
        unit: test.unit,
        sourceLine: sourceLine,
      });
      matchedThisLine = true;
      break; // one test match per line is enough
    }

    if (!matchedThisLine) unmatchedLines.push(line);
  }

  return { matches, unmatchedLines };
}
