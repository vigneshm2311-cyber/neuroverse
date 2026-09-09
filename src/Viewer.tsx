import { useEffect, useState } from "react";
import { C, rgb, LETTERS, CHAPTERS, GlobalStyles, Scene, useReducedMotion } from "./Neuroverse";
import { POLL_SECONDS, castVote, fetchTally, fetchTurnout, type Tally } from "./live";
import { useCountdown, useRoom } from "./useRoom";
import { PollBars, TimerRing } from "./PresentUI";

/* ============================================================================
   VIEWER

   A phone in a dark room. It follows the presenter and never leads: there is no
   next button here, and no way to see the breakdown early. What it does own is
   the one vote this device is allowed to cast.
   ========================================================================== */

export default function Viewer({ code }: { code: string }) {
  const reduced = useReducedMotion();
  const room = useRoom(code);
  const [picked, setPicked] = useState<Record<number, number>>(() => {
    try { return JSON.parse(localStorage.getItem(`neuroverse.picks.${code}`) ?? "{}"); }
    catch { return {}; }
  });
  const [tally, setTally] = useState<Tally[]>([]);
  const [turnout, setTurnout] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const phase = room?.phase ?? "lobby";
  const chapter = room?.chapter ?? 0;
  const ch = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)];
  const left = useCountdown(phase === "question" ? room?.poll_ends_at ?? null : null);
  const myPick = picked[chapter];

  /* A code that matches nothing should say so rather than spin forever. */
  useEffect(() => {
    const t = setTimeout(() => { if (!room) setMissing(true); }, 6000);
    return () => clearTimeout(t);
  }, [room]);

  useEffect(() => {
    if (phase !== "question") return;
    let alive = true;
    const pull = () => { fetchTurnout(code, chapter).then((n) => { if (alive) setTurnout(n); }).catch(() => {}); };
    pull();
    const t = setInterval(pull, 2500);
    return () => { alive = false; clearInterval(t); };
  }, [code, phase, chapter]);

  useEffect(() => {
    if (phase !== "results" && phase !== "reveal") { setTally([]); return; }
    let alive = true;
    fetchTally(code, chapter).then((t) => { if (alive) setTally(t); }).catch(() => {});
    return () => { alive = false; };
  }, [code, phase, chapter]);

  useEffect(() => { setNotice(null); }, [chapter, phase]);

  async function choose(i: number) {
    if (sending || myPick !== undefined) return;
    setSending(true);
    try {
      await castVote(code, chapter, i);
      const next = { ...picked, [chapter]: i };
      setPicked(next);
      try { localStorage.setItem(`neuroverse.picks.${code}`, JSON.stringify(next)); } catch { /* private window */ }
    } catch {
      setNotice("That poll has closed.");
    } finally {
      setSending(false);
    }
  }

  if (!room) {
    return (
      <Shell>
        <div style={{ fontSize: 11, letterSpacing: "0.26em", color: C.faint, textAlign: "center" }}>
          {missing ? `NO ROOM CALLED ${code}` : "FINDING THE ROOM"}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 26 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.28em", color: C.muted }}>NEUROVERSE</span>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", color: C.faint }}>
            {phase === "lobby" ? code : `${String(Math.min(chapter + 1, CHAPTERS.length)).padStart(2, "0")} / ${CHAPTERS.length}`}
          </span>
        </div>

        {phase === "lobby" && (
          <div style={{ textAlign: "center", paddingTop: "18vh" }}>
            <div className="nv-prose" style={{ fontSize: 25, color: "#f2f8ff" }}>You're in.</div>
            <p className="nv-prose" style={{ marginTop: 12, color: C.muted, fontSize: 15.5, lineHeight: 1.7 }}>
              Keep this open. The first question appears here when the talk begins.
            </p>
          </div>
        )}

        {(phase === "question" || phase === "results" || phase === "reveal") && (
          <div className="nv-stage3d" style={{ width: "min(250px, 54vw, 23vh)", margin: "0 auto 20px" }}>
            <div className="nv-float">
              <div className={reduced ? undefined : "nv-turn"}>
                <Scene
                  scene={phase === "reveal" ? ch.scene : ch.region ? "brain" : ch.scene}
                  region={ch.region}
                />
              </div>
            </div>
          </div>
        )}

        {phase === "question" && (
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
              {left !== null && <TimerRing left={left} total={POLL_SECONDS} size={58} />}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 19, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{turnout}</div>
                <div style={{ fontSize: 9, letterSpacing: "0.22em", color: C.faint }}>
                  {turnout === 1 ? "ANSWER IN" : "ANSWERS IN"}
                </div>
              </div>
            </div>

            <h1 className="nv-prose" style={{ color: "#f2f8ff", fontWeight: 400, fontSize: "clamp(17px,4.6vw,21px)", lineHeight: 1.45 }}>
              {ch.question}
            </h1>

            <div style={{ marginTop: 22, borderTop: `1px solid ${C.line}` }}>
              {ch.options.map((opt, i) => {
                const mine = myPick === i;
                const locked = myPick !== undefined;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(i)}
                    disabled={locked || sending}
                    className="nv-btn text-left"
                    style={{
                      display: "flex", alignItems: "baseline", gap: 14, width: "100%",
                      padding: "17px 6px", background: mine ? `rgba(${rgb(C.bio)},0.09)` : "none",
                      borderTop: "none", borderLeft: "none", borderRight: "none",
                      borderBottom: `1px solid ${mine ? `rgba(${rgb(C.bio)},0.45)` : C.line}`,
                      color: mine ? C.text : locked ? C.faint : C.body,
                      cursor: locked ? "default" : "pointer",
                      /* comfortably tappable in a dark lecture theatre */
                      minHeight: 56,
                    }}
                  >
                    <span style={{ fontSize: 10.5, letterSpacing: "0.2em", width: 16, flexShrink: 0, color: mine ? C.bio : C.faint }}>
                      {mine ? "●" : LETTERS[i]}
                    </span>
                    <span className="nv-prose" style={{ fontSize: "clamp(15px,4vw,17px)", lineHeight: 1.5 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <p style={{ marginTop: 16, fontSize: 10, letterSpacing: "0.18em", color: myPick !== undefined ? C.bio : C.faint }}>
              {notice ? notice.toUpperCase()
                : myPick !== undefined ? "ANSWER LOCKED — WAIT FOR THE ROOM"
                  : "ANSWER FROM WHAT YOU ALREADY KNOW"}
            </p>
          </>
        )}

        {(phase === "results" || phase === "reveal") && (
          <>
            <div style={{ fontSize: 10, letterSpacing: "0.26em", color: phase === "reveal" ? C.bio : C.muted, marginBottom: 16 }}>
              {phase === "results" ? "WHAT THE ROOM SAID" : "THE ANSWER"}
            </div>
            <p className="nv-prose" style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.6, marginBottom: 22 }}>
              {ch.question}
            </p>

            <PollBars ch={ch} tally={tally} correct={phase === "reveal" ? ch.correct : undefined} compact />

            {myPick !== undefined && (
              <p style={{ marginTop: 18, fontSize: 10, letterSpacing: "0.2em", color: phase === "reveal" ? (myPick === ch.correct ? C.bio : C.muted) : C.faint }}>
                {phase === "reveal"
                  ? (myPick === ch.correct ? "YOU WERE RIGHT" : `YOU CHOSE ${LETTERS[myPick]} — NOT QUITE`)
                  : `YOU CHOSE ${LETTERS[myPick]}`}
              </p>
            )}

            {phase === "reveal" && (
              <div className="nv-rise" style={{ marginTop: 26, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>
                <div style={{ fontSize: 9.5, letterSpacing: "0.24em", color: C.bio }}>WHAT YOU JUST DESCRIBED</div>
                <p className="nv-prose" style={{ marginTop: 10, color: C.body, fontSize: 15, lineHeight: 1.72 }}>{ch.brain}</p>

                <p className="nv-prose" style={{ marginTop: 24, color: "#f2f8ff", fontSize: 19, lineHeight: 1.45 }}>{ch.bridge}</p>

                <div style={{ marginTop: 22, fontSize: 9.5, letterSpacing: "0.24em", color: C.ai }}>{ch.name.toUpperCase()}</div>
                {ch.teach.map((para, i) => (
                  <p key={i} className="nv-prose" style={{ marginTop: 12, color: C.body, fontSize: 15, lineHeight: 1.72 }}>{para}</p>
                ))}

                <div style={{ marginTop: 24, paddingLeft: 14, borderLeft: `1px solid rgba(${rgb(C.ai)},0.35)` }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.22em", color: C.faint }}>WORTH KNOWING</div>
                  <p className="nv-prose" style={{ marginTop: 8, color: C.muted, fontSize: 14, lineHeight: 1.7 }}>{ch.note}</p>
                </div>
              </div>
            )}
          </>
        )}

        {phase === "final" && (
          <div style={{ textAlign: "center", paddingTop: "14vh" }}>
            <div className="nv-prose" style={{ fontSize: 23, color: "#f2f8ff", lineHeight: 1.4 }}>
              Every step of that was a question about the brain.
            </div>
            <p className="nv-prose" style={{ marginTop: 16, color: C.muted, fontSize: 15.5, lineHeight: 1.7 }}>
              You answered {Object.keys(picked).length} of {CHAPTERS.length} from clinical knowledge alone.
            </p>
            <a href="/" style={{ display: "inline-block", marginTop: 28, fontSize: 10.5, letterSpacing: "0.2em", color: C.bio, textDecoration: "none", borderBottom: `1px solid rgba(${rgb(C.bio)},0.4)`, paddingBottom: 4 }}>
              GO THROUGH IT AGAIN ALONE
            </a>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="nv" style={{
      minHeight: "100dvh", background: C.ink, color: C.text,
      display: "flex", justifyContent: "center",
      padding: "22px 20px calc(28px + env(safe-area-inset-bottom))",
    }}>
      <GlobalStyles />
      {children}
    </div>
  );
}
