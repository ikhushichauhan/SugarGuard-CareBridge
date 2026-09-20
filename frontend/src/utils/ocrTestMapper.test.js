/* global process */
import { extractLabCandidates } from "./ocrTestMapper.js";
import { LAB_TEST_IDS } from "./labRanges.js";

// Helper assertions
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`);
  }
}

function runTests() {
  console.log("Running ocrTestMapper tests...\n");
  let passed = 0;
  let failed = 0;

  function test(description, fn) {
    try {
      fn();
      console.log(`✓ PASS: ${description}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${description}`);
      console.error(`  ${err.message}`);
      failed++;
    }
  }

  // 1. User's sample report test case
  test("Sample report with HbA1c, 2-Hour OGTT, FPG, and RBG", () => {
    const rawText = `
PATIENT LABORATORY REPORT
Fasting Blood Glucose: 110 mg/dL
2-Hour OGTT: 178 mg/dL
HbA1c: 6.8%
Random Blood Sugar: 145 mg/dL
    `;

    const { matches } = extractLabCandidates(rawText);
    assertEqual(matches.length, 4, "Should extract 4 candidate matches");

    const fpg = matches.find((m) => m.testId === LAB_TEST_IDS.FPG);
    assertEqual(fpg?.value, 110, "FPG value should be 110");
    assertEqual(fpg?.unit, "mg/dL", "FPG unit should be mg/dL");

    const ogtt = matches.find((m) => m.testId === LAB_TEST_IDS.OGTT);
    assertEqual(ogtt?.value, 178, "OGTT value should be 178");
    assertEqual(ogtt?.unit, "mg/dL", "OGTT unit should be mg/dL");

    const hba1c = matches.find((m) => m.testId === LAB_TEST_IDS.HBA1C);
    assertEqual(hba1c?.value, 6.8, "HbA1c value should be 6.8");
    assertEqual(hba1c?.unit, "%", "HbA1c unit should be %");

    const rbg = matches.find((m) => m.testId === LAB_TEST_IDS.RBG);
    assertEqual(rbg?.value, 145, "RBG value should be 145");
    assertEqual(rbg?.unit, "mg/dL", "RBG unit should be mg/dL");
  });

  // 2. Concatenated OCR misreads (e.g. HbA1c1, HbAlc)
  test("OCR text with concatenated misreads (HbA1c1 6.8%, 2-Hour OGTT 178mg/dL)", () => {
    const rawText = `
HbA1c1 6.8%
2-Hour OGTT 178 mg/dL
    `;

    const { matches } = extractLabCandidates(rawText);
    const hba1c = matches.find((m) => m.testId === LAB_TEST_IDS.HBA1C);
    assertEqual(hba1c?.value, 6.8, "HbA1c1 value should be extracted as 6.8");

    const ogtt = matches.find((m) => m.testId === LAB_TEST_IDS.OGTT);
    assertEqual(ogtt?.value, 178, "2-Hour OGTT value should be extracted as 178");
  });

  // 3. Alternate test name variations
  test("Alternate test name variants (HbAlc, FBS, RBS, 2 hr post glucose)", () => {
    const rawText = `
HbAlc : 7.2 %
FBS - 105 mg/dl
RBS 160 mg/dL
2 hr post glucose: 185 mg/dL
    `;

    const { matches } = extractLabCandidates(rawText);
    const hba1c = matches.find((m) => m.testId === LAB_TEST_IDS.HBA1C);
    assertEqual(hba1c?.value, 7.2, "HbAlc variant value should be 7.2");

    const fpg = matches.find((m) => m.testId === LAB_TEST_IDS.FPG);
    assertEqual(fpg?.value, 105, "FBS variant value should be 105");

    const rbg = matches.find((m) => m.testId === LAB_TEST_IDS.RBG);
    assertEqual(rbg?.value, 160, "RBS variant value should be 160");

    const ogtt = matches.find((m) => m.testId === LAB_TEST_IDS.OGTT);
    assertEqual(ogtt?.value, 185, "2 hr post glucose variant value should be 185");
  });

  // 4. Multi-line column layout
  test("Multi-line column layout where value is on next line", () => {
    const rawText = `
Fasting Blood Sugar
115 mg/dL
    `;

    const { matches } = extractLabCandidates(rawText);
    const fpg = matches.find((m) => m.testId === LAB_TEST_IDS.FPG);
    assertEqual(fpg?.value, 115, "Multi-line FPG value should be 115");
  });

  console.log(`\nTest Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
