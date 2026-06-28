import { useState } from "react";

// Professor Flock illustrated mentor avatar (Concept D beta). Falls back to the
// original eagle emoji if the image fails to load, so the UI never blocks on an asset.
export function FlockAvatar({ size = 40, className = "", testid = "flock-avatar" }) {
  const [failed, setFailed] = useState(false);
  const dim = { width: size, height: size };

  if (failed) {
    return (
      <span
        role="img"
        aria-label="Professor Flock"
        data-testid={testid}
        className={`inline-grid place-items-center rounded-full bg-[#7E1818]/20 ${className}`}
        style={{ ...dim, fontSize: size * 0.6 }}
      >
        🦅
      </span>
    );
  }

  return (
    <img
      src="/professor-flock.jpg"
      alt="Professor Flock"
      data-testid={testid}
      loading="lazy"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded-full object-cover border border-[#D4AF37]/40 bg-[#0C0E11] ${className}`}
      style={dim}
    />
  );
}

// Professor Flock speech line with avatar, used for hints and study tips.
export function FlockSays({ children, size = 36, testid = "flock-says" }) {
  return (
    <div className="flex items-start gap-2 min-w-0" data-testid={testid}>
      <FlockAvatar size={size} className="shrink-0" />
      <p className="text-xs text-zinc-300 leading-relaxed min-w-0 break-words">
        <span className="font-semibold text-zinc-200">Professor Flock says: </span>
        {children}
      </p>
    </div>
  );
}
