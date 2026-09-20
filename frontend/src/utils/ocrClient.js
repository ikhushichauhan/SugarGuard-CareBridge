// ═══════════════════════════════════════════════════════════════════════
// SugarGuard CareBridge — OCR Client (integration boundary)
// ═══════════════════════════════════════════════════════════════════════
//
// This is the ONLY file that talks to an OCR engine. Swapping the engine
// (e.g. to a server-side AWS Textract call through API Gateway/Lambda,
// which would fit this project's existing AWS-native architecture) means
// changing only `runOcr()` below - nothing in LabReportPage.jsx or
// ocrTestMapper.js needs to change.
//
// Current engine: Tesseract.js (client-side, WASM, no API key required).
// Scope, tested and confirmed working:
//   - Image files (jpg, png, webp) with reasonably clear, printed text.
// NOT supported yet:
//   - PDF files. Tesseract.js only reads raster images; a PDF would need
//     to be rasterized to an image first (e.g. with pdf.js), which is not
//     wired up in this build. PDF uploads are explicitly rejected with a
//     clear message rather than silently failing or producing garbage.
//   - Handwritten reports, low-resolution photos, or heavily skewed scans
//     are not reliable with this engine - low-confidence results are
//     surfaced as "uncertain" rather than auto-populated.

import { createWorker } from "tesseract.js";

export const OCR_STATUS = {
  OK: "ok",
  LOW_CONFIDENCE: "low_confidence",
  UNSUPPORTED_FILE: "unsupported_file",
  NO_TEXT_FOUND: "no_text_found",
  ENGINE_ERROR: "engine_error",
};

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Below this average per-word confidence (Tesseract's own 0-100 score),
// we don't trust the extraction enough to auto-populate fields.
const MIN_CONFIDENCE = 60;

/**
 * @param {File} file
 * @returns {Promise<{
 *   status: string,
 *   rawText: string|null,
 *   confidence: number|null,
 *   message: string|null
 * }>}
 */
export async function runOcr(file) {
  if (!file) {
    return { status: OCR_STATUS.ENGINE_ERROR, rawText: null, confidence: null, message: "No file provided." };
  }

  if (file.type === "application/pdf") {
    return {
      status: OCR_STATUS.UNSUPPORTED_FILE,
      rawText: null,
      confidence: null,
      message:
        "PDF reports aren't supported by this build's OCR engine yet. Please upload a photo/screenshot of the report as an image, or enter values manually below.",
    };
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      status: OCR_STATUS.UNSUPPORTED_FILE,
      rawText: null,
      confidence: null,
      message: "Unsupported file type. Please upload a JPG, PNG, or WEBP image, or enter values manually below.",
    };
  }

  let worker;
  try {
    worker = await createWorker("eng");
    const { data } = await worker.recognize(file);
    await worker.terminate();

    const rawText = data.text || "";
    const confidence = typeof data.confidence === "number" ? data.confidence : null;

    if (!rawText.trim()) {
      return {
        status: OCR_STATUS.NO_TEXT_FOUND,
        rawText: "",
        confidence,
        message: "No readable text was found in this image. Please enter values manually below.",
      };
    }

    if (confidence !== null && confidence < MIN_CONFIDENCE) {
      return {
        status: OCR_STATUS.LOW_CONFIDENCE,
        rawText,
        confidence,
        message: "The report image was hard to read clearly. Please review the extracted values carefully, or enter them manually below.",
      };
    }

    return { status: OCR_STATUS.OK, rawText, confidence, message: null };
  } catch {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        /* ignore cleanup error */
      }
    }
    return {
      status: OCR_STATUS.ENGINE_ERROR,
      rawText: null,
      confidence: null,
      message: "Something went wrong while reading the image. Please enter values manually below.",
    };
  }
}
