import { useState } from "react";
import { Share2, Copy, Check, AlertCircle, Cloud } from "lucide-react";
import { FlockAvatar } from "@/components/FlockAvatar";
import { buildShare, copyText as copyToClipboard, nativeShare, canNativeShare } from "@/utils/shareResults";

// Reusable shareable result card for Play, Test, and Match / Fill results.
// Copyable text summary plus an optional native share. No downloads, no new
// dependencies, no stored data.
export function ShareResultCard({ result, testid = "share-result" }) {
  const share = buildShare(result);
  const [status, setStatus] = useState(null); // "copied" | "fallback" | "shared" | null
  const showNative = canNativeShare();

  async function handleCopy() {
    const ok = await copyToClipboard(share.copyText);
    setStatus(ok ? "copied" : "fallback");
    window.clearTimeout(handleCopy._t);
    handleCopy._t = window.setTimeout(() => setStatus(null), 5000);
  }

  async function handleShare() {
    const ok = await nativeShare({ title: share.shareTitle, text: share.copyText, url: share.link });
    if (ok) {
      setStatus("shared");
      window.clearTimeout(handleShare._t);
      handleShare._t = window.setTimeout(() => setStatus(null), 5000);
    }
  }

  return (
    <div className="rounded-lg border border-[#7E1818]/40 bg-[#0C0E11] p-5 sm:p-6" data-testid={`${testid}-card`}>
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D89090] mb-3">Share your result</div>

      {/* Visual result card */}
      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-[#161013] to-[#0C0E11] p-4 sm:p-5 mb-4" data-testid={`${testid}-visual`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center w-7 h-7 rounded-md bg-[#7E1818] text-white shrink-0">
            <Cloud size={15} strokeWidth={2.4} />
          </span>
          <span className="font-bold tracking-tight">CloudForge<span className="text-[#D32F2F]"> Cards</span></span>
          <FlockAvatar size={28} className="ml-auto shrink-0" />
        </div>
        <dl className="space-y-1.5">
          {share.lines.map((l) => (
            <div key={l.label} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-zinc-500">{l.label}</dt>
              <dd className="font-mono font-semibold text-zinc-100 text-right break-words">{l.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-zinc-400 mt-3 leading-relaxed break-words">{share.message}</p>
        <p className="text-[11px] font-mono text-[#D89090] mt-2 break-all">{share.link}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy result to clipboard"
          data-testid={`${testid}-copy`}
          className="inline-flex items-center justify-center gap-2 bg-[#7E1818] hover:bg-[#A02828] text-white px-4 py-2.5 rounded-md text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7E1818]/70"
        >
          <Copy size={15} /> Copy result
        </button>
        {showNative && (
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share result"
            data-testid={`${testid}-native`}
            className="inline-flex items-center justify-center gap-2 border border-white/15 hover:bg-white/5 text-zinc-200 px-4 py-2.5 rounded-md text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7E1818]/70"
          >
            <Share2 size={15} /> Share
          </button>
        )}
      </div>

      {/* Status message: icon plus text, not color alone. */}
      <div className="mt-2 min-h-[20px]" aria-live="polite" data-testid={`${testid}-status`}>
        {status === "copied" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#00E676]"><Check size={13} /> Result copied to your clipboard.</span>
        )}
        {status === "shared" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#00E676]"><Check size={13} /> Shared. Thanks for spreading the word.</span>
        )}
        {status === "fallback" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[#E6C75A]"><AlertCircle size={13} /> Could not copy automatically. Select the text above and copy it manually.</span>
        )}
      </div>
    </div>
  );
}
