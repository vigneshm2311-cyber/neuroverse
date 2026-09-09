import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { C, rgb, LETTERS, type Chapter } from "./Neuroverse";
import type { Tally } from "./live";

/* ---------------------------------------------------------------------------
   QR
   Drawn as one SVG path rather than a grid of rects: a 41x41 code is ~1700
   nodes, and on the lobby slide it is displayed large and left on screen.
   ------------------------------------------------------------------------- */
export function QR({ url, size = 260 }: { url: string; size?: number }) {
  const { path, count } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { path: d, count: n };
  }, [url]);

  const pad = 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-pad} ${-pad} ${count + pad * 2} ${count + pad * 2}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code linking to ${url}`}
      style={{ background: "#f2f8ff", borderRadius: 4, display: "block" }}
    >
      <path d={path} fill={C.ink} />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   POLL BARS
   The room's answer, shown large. `correct` stays undefined until the presenter
   reveals, so the same component carries both beats: first what the room
   thought, then which one was right.
   ------------------------------------------------------------------------- */
export function PollBars({
  ch,
  tally,
  correct,
  compact = false,
}: {
  ch: Chapter;
  tally: Tally[];
  correct?: number;
  compact?: boolean;
}) {
  const counts = ch.options.map((_, i) => tally.find((t) => t.choice === i)?.votes ?? 0);
  const total = counts.reduce((a, b) => a + b, 0);
  const peak = Math.max(1, ...counts);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 18 }}>
      {ch.options.map((opt, i) => {
        const n = counts[i];
        const share = total ? Math.round((n / total) * 100) : 0;
        const revealed = correct !== undefined;
        const isRight = revealed && i === correct;
        /* Before the reveal the leading bar is emphasised — that is the room's
           answer, which is the thing being shown. After it, emphasis moves to
           the correct bar, whether or not the room chose it. */
        const lead = !revealed && n === peak && n > 0;

        return (
          <div key={opt}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 7 }}>
              <span style={{
                fontSize: compact ? 10 : 11.5, letterSpacing: "0.2em", width: 16, flexShrink: 0,
                color: isRight ? C.bio : C.faint, fontWeight: 600,
              }}>
                {isRight ? "✓" : LETTERS[i]}
              </span>
              <span className="nv-prose" style={{
                flex: 1, lineHeight: 1.45,
                fontSize: compact ? "clamp(14px,3.4vw,16px)" : "clamp(15px,1.5vw,20px)",
                color: isRight ? "#f2f8ff" : revealed ? C.muted : C.text,
              }}>
                {opt}
              </span>
              <span style={{
                fontSize: compact ? 12 : 15, fontWeight: 600, flexShrink: 0,
                color: isRight ? C.bio : C.muted, fontVariantNumeric: "tabular-nums",
              }}>
                {share}%
              </span>
            </div>

            <div style={{ height: compact ? 6 : 10, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: `${total ? (n / peak) * 100 : 0}%`,
                background: isRight
                  ? C.bio
                  : lead
                    ? `rgba(${rgb(C.bio)},0.55)`
                    : `rgba(${rgb(C.ai)},0.42)`,
                transition: "width 900ms cubic-bezier(.16,.84,.44,1), background 600ms ease",
              }} />
            </div>

            {isRight && n === 0 && (
              <div style={{ marginTop: 7, fontSize: 9.5, letterSpacing: "0.22em", color: C.muted }}>
                NOBODY CHOSE THIS
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 4, fontSize: compact ? 9.5 : 10.5, letterSpacing: "0.24em", color: C.faint }}>
        {total === 0 ? "NO VOTES" : `${total} ${total === 1 ? "VOTE" : "VOTES"}`}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   COUNTDOWN
   A ring rather than digits: readable from the back of a room at a glance, and
   it stops being a number to stare at once it is obviously nearly gone.
   ------------------------------------------------------------------------- */
export function TimerRing({ left, total, size = 74 }: { left: number; total: number; size?: number }) {
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, left / total));
  const urgent = left <= 5;

  return (
    <svg width={size} height={size} viewBox="0 0 72 72" role="img" aria-label={`${left} seconds left`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="3" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={urgent ? C.ai : C.bio} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - frac)}
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 250ms linear, stroke 400ms ease" }}
      />
      <text
        x="36" y="41" textAnchor="middle"
        fill={urgent ? C.ai : C.text} fontSize="19" fontWeight="600"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {left}
      </text>
    </svg>
  );
}

/* Small persistent join hint, so latecomers can still get in mid-talk. */
export function JoinBadge({ code, url }: { code: string; url: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <QR url={url} size={54} />
      <div>
        <div style={{ fontSize: 9, letterSpacing: "0.24em", color: C.faint }}>JOIN</div>
        <div style={{ fontSize: 15, letterSpacing: "0.16em", color: C.text, fontWeight: 600 }}>{code}</div>
      </div>
    </div>
  );
}
