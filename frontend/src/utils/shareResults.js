// Helpers for CloudForge Cards shareable result cards.
// Frontend-only: builds copyable text from result data already in the browser.
// No backend calls, no stored user data.

export const APP_URL = "https://cloudforge-cards.emergent.host/";
export const SHARE_TITLE = "CloudForge Cards";

export function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

// Copy text to the clipboard. Tries the async Clipboard API first, then a
// hidden textarea fallback. Returns true on success. Never throws.
export async function copyText(text) {
  const value = String(text || "");
  if (!value) return false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch (e) {
    console.warn("CloudForge share: clipboard API failed, trying fallback", e);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    console.warn("CloudForge share: copy fallback failed", e);
    return false;
  }
}

// Open the native share sheet when available. Returns true if shared,
// false if unavailable or the user canceled. Never throws.
export async function nativeShare({ title, text, url }) {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch (e) {
    // AbortError means the user dismissed the sheet; treat as a non-error no-op.
    return false;
  }
}

// Build the display lines, short message, and copy text for a result.
// Any value that is not available is omitted cleanly.
export function buildShare(result) {
  const link = APP_URL;

  if (result.kind === "play") {
    const scoreStr = `${result.total} / ${result.maxTotal}`;
    const lines = [
      { label: "Mode", value: result.modeLabel },
      { label: "Final session total", value: scoreStr },
    ];
    if (Number.isFinite(result.overflow) && result.overflow > 0) {
      lines.push({ label: "Overflow bonus", value: `+${result.overflow}` });
    }
    if (Number.isFinite(result.roundsCompleted)) {
      lines.push({ label: "Rounds completed", value: String(result.roundsCompleted) });
    }
    return {
      shareTitle: SHARE_TITLE,
      link,
      lines,
      message: "I practiced AWS architecture decisions with CloudForge Cards.",
      copyText: `I scored ${result.total} in ${result.modeLabel} on CloudForge Cards, a student-built AWS learning tool for practicing cloud architecture decisions. Try it here: ${link}`,
    };
  }

  if (result.kind === "test") {
    const lines = [{ label: "Mode", value: "Test Mode" }];
    if (Number.isFinite(result.percent)) lines.push({ label: "Score", value: `${result.percent}% correct` });
    if (Number.isFinite(result.correct) && Number.isFinite(result.total)) {
      lines.push({ label: "Correct", value: `${result.correct} of ${result.total}` });
    }
    const scoreLabel = Number.isFinite(result.percent) ? `${result.percent}%` : "a solid score";
    return {
      shareTitle: SHARE_TITLE,
      link,
      lines,
      message: "I reviewed AWS certification-style concepts with CloudForge Cards.",
      copyText: `I completed Test Mode on CloudForge Cards and scored ${scoreLabel}. It is a student-built AWS learning tool for cloud learners. Try it here: ${link}`,
    };
  }

  // match / fill
  const lines = [{ label: "Mode", value: "Match / Fill" }];
  if (Number.isFinite(result.percent)) lines.push({ label: "Score", value: `${result.percent}% correct` });
  if (Number.isFinite(result.correct) && Number.isFinite(result.total)) {
    lines.push({ label: "Correct", value: `${result.correct} of ${result.total}` });
  } else if (Number.isFinite(result.total)) {
    lines.push({ label: "Pipelines", value: String(result.total) });
  }
  const scoreLabel = Number.isFinite(result.percent) ? `${result.percent}%` : "a solid score";
  return {
    shareTitle: SHARE_TITLE,
    link,
    lines,
    message: "I practiced AWS service matching with CloudForge Cards.",
    copyText: `I completed Match / Fill Mode on CloudForge Cards and scored ${scoreLabel}. It is a student-built AWS learning tool for practicing AWS service matching. Try it here: ${link}`,
  };
}
