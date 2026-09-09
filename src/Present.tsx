import { useCallback, useEffect, useRef, useState } from "react";
import {
  C, rgb, LETTERS, CHAPTERS, GlobalStyles, Scene, useReducedMotion,
} from "./Neuroverse";
import {
  POLL_SECONDS, clearPresenter, createRoom, fetchRoom, fetchTally, fetchTurnout,
  loadPresenter, savePresenter, setPhase, type Phase, type Tally,
} from "./live";
import { viewerUrl } from "./route";
import { useCountdown, useRoom } from "./useRoom";
import { JoinBadge, PollBars, QR, TimerRing } from "./PresentUI";

/* ============================================================================
   PRESENTER

   This screen is the projection. It also happens to be the only client allowed
   to move the deck, and the only one that closes a poll when its timer runs out
   — one writer, so the room can never disagree with itself about which slide it
   is on.
   ========================================================================== */

export default function Present() {
  const reduced = useReducedMotion();
  const [creds, setCreds] = useState(loadPresenter);
  const [booting, setBooting] = useState(true);
  const [fatal, setFatal] = useState<string | null>(null);

  /* Reclaim the stored room if it still exists, otherwise open a fresh one.
     A presenter who reloads mid-talk keeps the room and the audience with it. */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = loadPresenter();
        if (stored && (await fetchRoom(stored.code))) {
          if (alive) { setCreds(stored); setBooting(false); }
          return;
        }
        clearPresenter();
        const fresh = await createRoom();
        savePresenter(fresh);
        if (alive) { setCreds(fresh); setBooting(false); }
      } catch (e) {
        if (alive) { setFatal(e instanceof Error ? e.message : String(e)); setBooting(false); }
      }
    })();
    return () => { alive = false; };
  }, []);

  const room = useRoom(creds?.code ?? null);
  const phase: Phase = room?.phase ?? "lobby";
  const chapter = room?.chapter ?? 0;
  const ch = CHAPTERS[Math.min(chapter, CHAPTERS.length - 1)];
  const left = useCountdown(phase === "question" ? room?.poll_ends_at ?? null : null);

  const [tally, setTally] = useState<Tally[]>([]);
  const [turnout, setTurnout] = useState(0);
  const [busy, setBusy] = useState(false);

  /* ---- moving the deck ------------------------------------------------- */
  const go = useCallback(async (next: Phase, nextChapter: number, seconds: number | null) => {
    if (!creds) return;
    setBusy(true);
    try {
      await setPhase(creds, next, nextChapter, seconds);
    } catch {
      /* Left on the current slide rather than desynced; the button still works. */
    } finally {
      setBusy(false);
    }
  }, [creds]);

  const advance = useCallback(() => {
    if (!room) return;
    const last = chapter >= CHAPTERS.length - 1;
    switch (room.phase) {
      case "lobby":    return go("question", 0, POLL_SECONDS);
      case "question": return go("results", chapter, null);          // closing early is allowed
      case "results":  return go("reveal", chapter, null);
      case "reveal":   return last ? go("final", chapter, null)
                                   : go("question", chapter + 1, POLL_SECONDS);
      default:         return;
    }
  }, [room, chapter, go]);

  const retreat = useCallback(() => {
    if (!room) return;
    switch (room.phase) {
      case "question": return chapter === 0 ? go("lobby", 0, null) : go("reveal", chapter - 1, null);
      case "results":  return go("question", chapter, POLL_SECONDS); // reopens the poll
      case "reveal":   return go("results", chapter, null);
      case "final":    return go("reveal", CHAPTERS.length - 1, null);
      default:         return;
    }
  }, [room, chapter, go]);

  /* Close the poll the moment the clock runs out. Only this client does it. */
  const closing = useRef(false);
  useEffect(() => {
    if (phase !== "question" || left === null) { closing.current = false; return; }
    if (left <= 0 && !closing.current) {
      closing.current = true;
      go("results", chapter, null);
    }
  }, [phase, left, chapter, go]);

  /* Turnout is a count, never a breakdown — safe to show while voting is open. */
  useEffect(() => {
    if (!creds || phase !== "question") return;
    let alive = true;
    const pull = () => {
      fetchTurnout(creds.code, chapter).then((n) => { if (alive) setTurnout(n); }).catch(() => {});
    };
    pull();
    const t = setInterval(pull, 2000);
    return () => { alive = false; clearInterval(t); };
  }, [creds, phase, chapter]);

  /* The breakdown only exists once the poll is shut. */
  useEffect(() => {
    if (!creds || (phase !== "results" && phase !== "reveal")) { setTally([]); return; }
    let alive = true;
    fetchTally(creds.code, chapter).then((t) => { if (alive) setTally(t); }).catch(() => {});
    return () => { alive = false; };
  }, [creds, phase, chapter]);

  /* Space and the arrow keys, because that is what a presenter remote sends. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowRight" || e.key === "PageDown" || e.key === "Enter") {
        e.preventDefault(); advance();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault(); retreat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, retreat]);

  if (booting) return <Splash line="OPENING THE ROOM" />;
  if (fatal || !creds) return <Splash line="COULD NOT OPEN A ROOM" detail={fatal ?? undefined} />;

  const url = viewerUrl(creds.code);
  const nextLabel =
    phase === "lobby" ? "START"
      : phase === "question" ? "CLOSE POLL NOW"
        : phase === "results" ? "REVEAL THE ANSWER"
          : phase === "reveal" ? (chapter >= CHAPTERS.length - 1 ? "FINISH" : "NEXT QUESTION")
            : "";

  return (
    <div className="nv" style={{ minHeight: "100dvh", background: C.ink, color: C.text, display: "flex", flexDirection: "column" }}>
      <GlobalStyles />

      <header className="flex items-center justify-between" style={{ padding: "18px 30px", flexShrink: 0 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.3em", color: C.muted }}>NEUROVERSE</span>
        {phase !== "lobby" && (
          <span style={{ fontSize: 11, letterSpacing: "0.22em", color: C.faint }}>
            {String(Math.min(chapter + 1, CHAPTERS.length)).padStart(2, "0")} / {CHAPTERS.length}
          </span>
        )}
        {phase !== "lobby" && <JoinBadge code={creds.code} url={url} />}
      </header>

      <main style={{ flex: 1, minHeight: 0, padding: "0 30px", overflowY: "auto" }}>
        {phase === "lobby" && <Lobby code={creds.code} url={url} />}

        {phase !== "lobby" && phase !== "final" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-5" style={{ gap: 40, alignItems: "start", paddingTop: 8 }}>
            <div className="lg:col-span-2 flex flex-col items-center" style={{ position: "sticky", top: 8 }}>
              <div className="nv-stage3d" style={{ width: phase === "reveal" ? "min(280px, 100%)" : "min(400px, 100%)", transition: "width 700ms cubic-bezier(.16,.84,.44,1)" }}>
                <div className="nv-float"><div className={reduced ? undefined : "nv-turn"}>
                  <Scene scene={ch.region ? "brain" : ch.scene} region={ch.region} />
                </div></div>
              </div>
              {phase === "question" && left !== null && (
                <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 18 }}>
                  <TimerRing left={left} total={POLL_SECONDS} />
                  <div>
                    <div style={{ fontSize: 27, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{turnout}</div>
                    <div style={{ fontSize: 9.5, letterSpacing: "0.24em", color: C.faint }}>
                      {turnout === 1 ? "ANSWER IN" : "ANSWERS IN"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3" style={{ paddingBottom: 30 }}>
              <div style={{ fontSize: 10.5, letterSpacing: "0.28em", color: C.bio, marginBottom: 14 }}>
                {String(chapter + 1).padStart(2, "0")} — {ch.title.toUpperCase()}
              </div>

              <h1 className="nv-prose" style={{
                color: "#f2f8ff", fontWeight: 400, letterSpacing: "-0.015em",
                fontSize: phase === "question" ? "clamp(22px,2.6vw,38px)" : "clamp(18px,1.7vw,25px)",
                lineHeight: 1.35, maxWidth: "24em", transition: "font-size 500ms ease",
              }}>
                {ch.question}
              </h1>

              {phase === "question" && (
                <div style={{ marginTop: 30, borderTop: `1px solid ${C.line}` }}>
                  {ch.options.map((opt, i) => (
                    <div key={opt} style={{
                      display: "flex", alignItems: "baseline", gap: 18, padding: "15px 2px",
                      borderBottom: `1px solid ${C.line}`,
                    }}>
                      <span style={{ fontSize: 12, letterSpacing: "0.2em", color: C.faint, width: 18, flexShrink: 0 }}>
                        {LETTERS[i]}
                      </span>
                      <span className="nv-prose" style={{ fontSize: "clamp(16px,1.5vw,22px)", lineHeight: 1.45 }}>{opt}</span>
                    </div>
                  ))}
                  <p style={{ marginTop: 18, fontSize: 10.5, letterSpacing: "0.2em", color: C.faint }}>
                    ANSWER ON YOUR PHONE — {creds.code}
                  </p>
                </div>
              )}

              {(phase === "results" || phase === "reveal") && (
                <div style={{ marginTop: 26 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: "0.26em", color: phase === "reveal" ? C.bio : C.muted, marginBottom: 18 }}>
                    {phase === "results" ? "WHAT THE ROOM SAID" : "THE ANSWER"}
                  </div>
                  <PollBars ch={ch} tally={tally} correct={phase === "reveal" ? ch.correct : undefined} />
                </div>
              )}

              {phase === "reveal" && <Teaching chapter={chapter} />}
            </div>
          </div>
        )}

        {phase === "final" && <Closing />}
      </main>

      <footer className="flex items-center justify-between" style={{
        padding: "16px 30px", flexShrink: 0, borderTop: `1px solid ${C.line}`,
      }}>
        <button onClick={retreat} className="nv-btn" style={{
          background: "none", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 2,
          padding: "10px 16px", fontSize: 10.5, letterSpacing: "0.2em", cursor: "pointer",
        }}>BACK</button>

        <span style={{ fontSize: 9.5, letterSpacing: "0.2em", color: C.faint }}>SPACE ADVANCES</span>

        {nextLabel && (
          <button onClick={advance} disabled={busy} className="nv-btn nv-cta" style={{
            background: C.bio, border: "none", color: C.ink, borderRadius: 2,
            padding: "13px 24px", fontSize: 11.5, letterSpacing: "0.2em", fontWeight: 600,
            cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
          }}>{nextLabel}</button>
        )}
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SLIDES
   ------------------------------------------------------------------------- */
function Lobby({ code, url }: { code: string; url: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "62vh", textAlign: "center" }}>
      <h1 className="nv-prose" style={{ fontSize: "clamp(30px,4.4vw,58px)", color: "#f2f8ff", fontWeight: 400, letterSpacing: "-0.02em" }}>
        Neuroverse
      </h1>
      <p className="nv-prose" style={{ marginTop: 12, color: C.body, fontSize: "clamp(15px,1.5vw,19px)", maxWidth: "26em", lineHeight: 1.6 }}>
        Ten questions about the brain. Answer on your phone — every one of them is
        something you already know.
      </p>

      <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", justifyContent: "center" }}>
        <QR url={url} size={230} />
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.26em", color: C.faint }}>SCAN, OR GO TO</div>
          <div style={{ marginTop: 8, fontSize: "clamp(15px,1.4vw,19px)", color: C.text }}>
            {url.replace(/^https?:\/\//, "")}
          </div>
          <div style={{ marginTop: 26, fontSize: 10, letterSpacing: "0.26em", color: C.faint }}>ROOM</div>
          <div style={{ marginTop: 4, fontSize: "clamp(34px,3.6vw,52px)", letterSpacing: "0.16em", color: C.bio, fontWeight: 600 }}>
            {code}
          </div>
        </div>
      </div>
    </div>
  );
}

function Teaching({ chapter }: { chapter: number }) {
  const ch = CHAPTERS[chapter];
  return (
    <div className="nv-rise" style={{ marginTop: 34, borderTop: `1px solid ${C.line}`, paddingTop: 26 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.26em", color: C.bio }}>WHAT YOU JUST DESCRIBED</div>
      <p className="nv-prose" style={{ marginTop: 12, color: C.body, fontSize: "clamp(14px,1.15vw,17px)", lineHeight: 1.7, maxWidth: "40em" }}>
        {ch.brain}
      </p>

      <p className="nv-prose" style={{
        marginTop: 22, color: "#f2f8ff", fontSize: "clamp(17px,1.55vw,25px)",
        lineHeight: 1.45, maxWidth: "26em", letterSpacing: "-0.01em",
      }}>
        {ch.bridge}
      </p>

      <div style={{ marginTop: 22, fontSize: 10, letterSpacing: "0.26em", color: C.ai }}>{ch.name.toUpperCase()}</div>
      {ch.teach.map((para, i) => (
        <p key={i} className="nv-prose" style={{ marginTop: 12, color: C.body, fontSize: "clamp(14px,1.15vw,17px)", lineHeight: 1.7, maxWidth: "40em" }}>
          {para}
        </p>
      ))}

      <div style={{ marginTop: 22, paddingLeft: 16, borderLeft: `1px solid rgba(${rgb(C.ai)},0.35)` }}>
        <div style={{ fontSize: 9.5, letterSpacing: "0.24em", color: C.faint }}>WORTH KNOWING</div>
        <p className="nv-prose" style={{ marginTop: 8, color: C.muted, fontSize: "clamp(13.5px,1.05vw,15.5px)", lineHeight: 1.7, maxWidth: "38em" }}>
          {ch.note}
        </p>
      </div>
    </div>
  );
}

function Closing() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "62vh", textAlign: "center" }}>
      <h1 className="nv-prose" style={{ fontSize: "clamp(24px,3vw,44px)", color: "#f2f8ff", fontWeight: 400, maxWidth: "18em", lineHeight: 1.35 }}>
        Every step of that was a question about the brain.
      </h1>
      <p className="nv-prose" style={{ marginTop: 20, color: C.muted, fontSize: "clamp(15px,1.4vw,18px)", maxWidth: "30em", lineHeight: 1.7 }}>
        Nothing was simplified to get here — this is genuinely what the field is.
        The vocabulary was new. The ideas were already yours.
      </p>
    </div>
  );
}

function Splash({ line, detail }: { line: string; detail?: string }) {
  return (
    <div className="nv" style={{
      minHeight: "100dvh", background: C.ink, color: C.muted,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center",
    }}>
      <GlobalStyles />
      <div style={{ fontSize: 11, letterSpacing: "0.28em" }}>{line}</div>
      {detail && <div style={{ fontSize: 12, color: C.faint, maxWidth: "34em" }}>{detail}</div>}
    </div>
  );
}
