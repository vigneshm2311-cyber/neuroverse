import React, { useState, useEffect, useRef, useCallback } from "react";

type RegionKey = "frontal" | "parietal" | "occipital" | "temporal" | "hippocampus" | "cerebellum" | "all";
type SceneKey =
  | "brain" | "neuron" | "synapse" | "data" | "deep"
  | "vision" | "language" | "memory" | "agent" | "unified";

interface Chapter {
  n: string;
  title: string;
  scene: SceneKey;
  region: RegionKey | null;
  hook: string;
  question: string;
  options: string[];
  correct: number;
  brain: string;
  bridge: string;
  name: string;
  teach: string[];
  note: string;
  unlock: string;
}

interface PictureStep { k: string; t: string }

interface Stats { score: number; streak: number; best: number }


/* ============================================================================
   NEUROVERSE

   One neuroscience question per chapter — answerable by any clinician.
   One AI concept per chapter — explained plainly, once, and then left alone.

   DESIGN LANGUAGE
   Two colours in the entire product: teal is biological, violet is artificial.
   Serif for explanation, sans for interface. Almost no boxes — hierarchy is
   carried by type, space and hairlines, so the reading never feels like a form.
   ========================================================================== */

const C = {
  ink: "#05070e",
  deep: "#080d1a",
  bio: "#5eead4",       // everything about the brain
  ai: "#a78bfa",        // everything about AI
  text: "#e8eef7",
  body: "#a8b5c7",
  muted: "#7c8ba3",
  faint: "#556173",
  line: "rgba(255,255,255,0.09)",
};

const rgb = (hex: string): string => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ].join(",");
};

/* ---------------------------------------------------------------------------
   CONTENT
   brain  — one paragraph on what they just described
   bridge — the single sentence that connects it
   name   — the AI concept
   teach  — one or two plain paragraphs. This is the whole lesson.
   note   — one honest limit, quietly placed
   ------------------------------------------------------------------------- */
const CHAPTERS: Chapter[] = [
  {
    n: "I",
    title: "Deciding",
    scene: "brain",
    region: "frontal",
    hook: "Start where you already stand: at the bedside, with a patient who does not add up.",
    question:
      "A previously meticulous 54-year-old has become impulsive and socially disinhibited. He recalls conversations accurately and navigates the ward without difficulty, but cannot sequence the steps of making tea, and keeps applying a rule long after it has stopped working. Where is the lesion?",
    options: [
      "Temporal lobe",
      "Frontal lobe",
      "Parietal lobe",
      "Occipital lobe",
    ],
    correct: 1,
    brain:
      "Everything that stores and delivers information is intact — he recalls, he navigates, he speaks. What is damaged is the part that holds a goal, picks the action that serves it, and stops the actions that don't.",
    bridge: "That gap — between holding information and deciding with it — is where artificial intelligence lives.",
    name: "What AI actually means",
    teach: [
      "Artificial intelligence is any system that takes information in and works out what to do with it. That is the entire definition. Not consciousness, not a robot, not a machine that thinks like a person.",
      "A textbook holds more medical information than you do and decides nothing. Everything in the next nine chapters is simply a different way of building the deciding part.",
    ],
    note: "Your frontal lobe runs this loop continuously, all day. An AI runs it once, when something asks it a question.",
    unlock: "What AI means",
  },
  {
    n: "II",
    title: "Firing",
    scene: "neuron",
    region: null,
    hook: "Past the lobes, past the tissue, down to a single cell.",
    question: "What determines whether a neuron fires?",
    options: [
      "The length of its axon",
      "The sum of its excitatory and inhibitory inputs reaching threshold",
      "The thickness of its myelin sheath",
      "The number of mitochondria in the soma",
    ],
    correct: 1,
    brain:
      "Thousands of synapses push the membrane potential up or down. The cell adds all of it together, and fires only if the total crosses threshold. All or none.",
    bridge: "You have just described everything an artificial neuron does.",
    name: "The artificial neuron",
    teach: [
      "An artificial neuron takes in many signals, treats some as more important than others, adds them up, and passes on a value if the total is high enough. That is the whole unit. There is nothing else inside it.",
      "Connect millions of these together and you have a neural network. Whenever you hear that a company has built an AI model, this is what is in it — vast numbers of these units, wired to each other.",
    ],
    note:
      "Real neurons are far richer: they signal in time, use dozens of channel types, and sit in a bath of neuromodulators. The artificial version is a caricature that happened to be useful. The 1943 paper that started all of it was written by a neurophysiologist, about neurons.",
    unlock: "The artificial neuron",
  },
  {
    n: "III",
    title: "Learning",
    scene: "synapse",
    region: null,
    hook: "A term from your second year that turns out to matter enormously.",
    question:
      "Repeated co-activation of two neurons produces a lasting increase in synaptic efficacy between them. What is this called?",
    options: [
      "Saltatory conduction",
      "Long-term potentiation",
      "Wallerian degeneration",
      "Reuptake inhibition",
    ],
    correct: 1,
    brain:
      "Learning is not new cells or new storage. It is the same neurons, connected differently — some connections strengthened, others allowed to fade.",
    bridge: "Training an AI means exactly this, and nothing more mysterious.",
    name: "Training",
    teach: [
      "A network begins with random connections and is shown examples. Each time it gets one wrong, the connections shift slightly in the direction that would have been right. Repeat this a few billion times and the network starts producing useful answers.",
      "That process is called training. When you read that a model has four hundred billion parameters, those parameters are connection strengths — the same quantity that changes in your synapses when you learn something.",
    ],
    note:
      "Your synapses keep changing all day. A model's stop the moment training ends. The system in front of you is frozen, and does not learn anything from your patients.",
    unlock: "Training",
  },
  {
    n: "IV",
    title: "Expertise",
    scene: "data",
    region: null,
    hook: "Before any of this was about machines, it was a question about how expertise forms at all.",
    question:
      "A radiology resident becomes accurate at reading chest films primarily through which process?",
    options: [
      "Memorising a comprehensive list of radiological rules",
      "Reading thousands of films with feedback on the confirmed diagnosis",
      "Improved visual acuity with training",
      "Faster conduction in the optic pathway",
    ],
    correct: 1,
    brain:
      "Nobody can write down every rule that separates a normal film from an early consolidation. Expertise comes from examples and correction, not instruction.",
    bridge: "This is how every diagnostic AI in existence is built.",
    name: "Learning from examples",
    teach: [
      "Instead of writing rules, you show the system thousands of cases with the confirmed answer attached, and let it work out the pattern for itself. This is why medical imaging came first: the field already had millions of films with diagnoses recorded next to them.",
      "It also inherits your failure mode. A resident who trained only in one hospital, on one population, does worse elsewhere — and so does a model. This is the commonest reason an impressive published result disappoints in your department.",
    ],
    note:
      "A resident learns from a few thousand cases and can sense when a film is strange. A model needs far more examples and has no equivalent instinct for strangeness.",
    unlock: "Learning from examples",
  },
  {
    n: "V",
    title: "Layers",
    scene: "deep",
    region: null,
    hook: "The visual pathway, and a Nobel Prize that quietly built modern AI.",
    question:
      "Neurons in V1 respond to oriented edges; neurons further along the ventral stream respond to whole objects and faces. What is this organisation called?",
    options: [
      "Retinotopic mapping",
      "Lateral inhibition",
      "Hierarchical feature processing",
      "Decussation",
    ],
    correct: 2,
    brain:
      "Edges first. Contours and textures next. A face at the end. No single cell sees the face — the hierarchy assembles it in stages.",
    bridge: "The word deep, in deep learning, refers to precisely this arrangement.",
    name: "Deep learning",
    teach: [
      "Deep means many layers, one feeding the next. The early layers of an image model pick up edges. The middle layers assemble textures and parts. The last layers respond to whole structures. Depth is the only thing the word is describing.",
      "This is not a loose analogy. Hubel and Wiesel's recordings from cat visual cortex directly inspired the first network built this way, which became the architecture behind modern image recognition.",
    ],
    note:
      "Your cortex sends as much information backwards as forwards. Most of these models only go one direction. The resemblance is real, but partial.",
    unlock: "Deep learning",
  },
  {
    n: "VI",
    title: "Recognising",
    scene: "vision",
    region: "occipital",
    hook: "A lesion that takes away something very specific, and leaves everything around it intact.",
    question:
      "A patient has normal acuity and full visual fields but cannot recognise the faces of family members. Where is the lesion?",
    options: [
      "Optic chiasm",
      "Lateral geniculate nucleus",
      "Fusiform gyrus",
      "Brainstem",
    ],
    correct: 2,
    brain:
      "The image arrives perfectly. The machinery that turns an image into an identity is damaged. Seeing and recognising are separate jobs, and a lesion can take one without the other.",
    bridge: "AI that looks at images has the same split — and the same possible failure.",
    name: "Computer vision",
    teach: [
      "Computer vision is software trained to turn an image into a description: this film shows consolidation, this lesion has irregular borders. The input is always perfect. Only the recognition can fail.",
      "And when it fails, it fails quietly. Show it an image unlike anything in its training — a different scanner, a paediatric film, an unusual projection — and it still returns a confident answer. That is why these systems belong in the role of a second look, not a reader.",
    ],
    note:
      "Your patient with agnosia usually senses that something is wrong. The model has no equivalent sense. A high score is not the same thing as a high chance of being right.",
    unlock: "Computer vision",
  },
  {
    n: "VII",
    title: "Fluency",
    scene: "language",
    region: null,
    hook: "The most useful thing neurology has to say about ChatGPT.",
    question:
      "Which aphasia presents with fluent, well-articulated, grammatically intact speech that carries little meaning, together with impaired comprehension?",
    options: [
      "Broca's aphasia",
      "Wernicke's aphasia",
      "Conduction aphasia",
      "Global aphasia",
    ],
    correct: 1,
    brain:
      "The speech stays fluent, grammatical and confident while its connection to meaning is broken — and the patient is usually unaware that anything is wrong.",
    bridge: "You have already met, at the bedside, the thing everyone calls a hallucination.",
    name: "Language models",
    teach: [
      "A language model writes by repeatedly choosing the most plausible next word. It is extraordinarily good at this, which is why the output reads so well. But producing fluent text and being correct are two different jobs, and only the first one is guaranteed.",
      "When they come apart, nothing on the surface changes. The invented dose, the citation that does not exist and the correct answer all arrive in the same calm, well-formatted prose. The rule that follows is simple: fluency is not evidence.",
    ],
    note:
      "There is no lesion here and no Wernicke's area. The resemblance is in what you observe, not in the mechanism — but the clinical instinct it gives you is the right one.",
    unlock: "Language models",
  },
  {
    n: "VIII",
    title: "Memory",
    scene: "memory",
    region: "hippocampus",
    hook: "The most studied patient in the history of neuroscience.",
    question:
      "After bilateral medial temporal resection, a patient retains childhood memories and can learn new motor skills, but forms no new episodic memories. Which structure was removed?",
    options: ["Hippocampus", "Cerebellum", "Occipital lobe", "Thalamus"],
    correct: 0,
    brain:
      "Everything from before is intact. Nothing new is ever laid down. The hippocampus is what binds today into something you will still have tomorrow.",
    bridge: "Every language model is in exactly this position.",
    name: "Giving AI a memory",
    teach: [
      "A model knows what it read while it was being trained, up to a cutoff date, and nothing after. Not last month's guideline. Not the conversation you had with it yesterday.",
      "The fix is unglamorous and effective: let it look things up before answering. Point it at your protocols, your formulary, the current guideline — it searches, then answers from what it found, and shows you the source. This is why the most useful question to ask of any medical AI is simply, can it show me where that came from.",
    ],
    note:
      "Looking something up is not remembering it. Nothing is stored or consolidated, and tomorrow it begins from nothing again.",
    unlock: "Giving AI a memory",
  },
  {
    n: "IX",
    title: "Acting",
    scene: "agent",
    region: "cerebellum",
    hook: "Movement — and the part of it nobody notices until it goes wrong.",
    question:
      "Which structure compares intended movement with actual movement and corrects the error while the movement is still happening?",
    options: ["Hippocampus", "Cerebellum", "Pituitary", "Amygdala"],
    correct: 1,
    brain:
      "The cerebellum holds what should happen, watches what is happening, and adjusts mid-flight. Remove it and movements still occur — they simply overshoot and miss.",
    bridge: "That loop is the entire difference between a chatbot and an agent.",
    name: "AI agents",
    teach: [
      "A chatbot produces text and stops. An agent is given a goal, does something about it, looks at what came back, and adjusts. The things it does are ordinary: search a database, run a calculation, read a document, update a record.",
      "Because an agent acts rather than only answers, the stakes change. One without a checking step is a limb without a cerebellum — still moving, still confident, consistently missing. Anything that cannot be easily undone needs a person in the loop.",
    ],
    note:
      "Cerebellar correction happens in milliseconds and never tires. An agent's loop is slow, and it will repeat the same wrong step until something stops it.",
    unlock: "AI agents",
  },
  {
    n: "X",
    title: "Together",
    scene: "unified",
    region: "all",
    hook: "One last question. Then the whole picture.",
    question:
      "Which best describes where complex behaviour such as clinical reasoning is generated in the brain?",
    options: [
      "A single intelligence centre in the prefrontal cortex",
      "Distributed networks of specialised regions working together",
      "The cerebellum, acting alone",
      "The brainstem reticular formation",
    ],
    correct: 1,
    brain:
      "Perception, memory, language, planning and movement are separate systems with separate lesions and separate deficits. Behaviour is what happens when they are connected.",
    bridge: "Artificial intelligence is built the same way, and this is the part most people get wrong.",
    name: "AI is a system, not a thing",
    teach: [
      "An assistant that reads notes, looks at images, checks a guideline and updates a record is not one clever model. It is a language model, a vision model, a way of looking things up, a few tools, and something deciding which to use — with a clinician on anything that matters.",
      "So the question is never whether to adopt AI. It is which capability, for which task, checked by whom. That question has your name on it, not an engineer's.",
    ],
    note:
      "Every part on that list fails in a different way, and a system has more ways to fail than any of its parts.",
    unlock: "AI is a system",
  },
];


/* the closing diagram: what an AI system is, built only from what they now know */
const PICTURE: PictureStep[] = [
  { k: "A unit", t: "Adds up whatever reaches it, and passes on a signal if the total is high enough. On its own it does almost nothing." },
  { k: "A network", t: "Millions of those units, wired together in layers." },
  { k: "Training", t: "Show it examples with the answers attached. The connections between the units change until the output is useful. That is the whole of learning." },
  { k: "What it can do then", t: "Show it images and it recognises. Show it text and it writes. Give it a library to search and it looks things up instead of answering from memory." },
  { k: "Tools and a loop", t: "Let it use tools and look at what came back, and it stops answering and starts doing." },
  { k: "A system", t: "Take only the parts you need for one particular job and put a clinician on the parts that matter. That is all anyone means by clinical AI." },
];

/* ---------------------------------------------------------------------------
   STYLE
   ------------------------------------------------------------------------- */
function GlobalStyles() {
  return (
    <style>{`
      .nv { font-family: ui-sans-serif, -apple-system, "SF Pro Text", "Segoe UI", Inter, system-ui, sans-serif; }
      .nv-prose { font-family: ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif; }
      .nv-screen { min-height: 100vh; min-height: 100dvh; }
      .nv-app { overflow-x: hidden; }
      .nv-rise { opacity:0; animation: nvRise 800ms cubic-bezier(.16,.84,.44,1) forwards; }
      .nv-fade { opacity:0; animation: nvFade 1000ms ease forwards; }
      .nv-punch { opacity:0; animation: nvPunch 1000ms cubic-bezier(.16,.9,.35,1) forwards; }
      .nv-cam { opacity:0; animation: nvCam 1000ms cubic-bezier(.16,.84,.44,1) forwards; }
      @keyframes nvFade { to { opacity:1; } }
      @keyframes nvRise { from { transform: translate3d(0,20px,0);} to { opacity:1; transform:none; } }
      @keyframes nvPunch { 0% { opacity:0; transform: translateY(14px) scale(.98); filter: blur(6px);} 100% { opacity:1; transform:none; filter:none; } }
      @keyframes nvCam { from { transform: scale(1.06); filter: blur(6px);} to { opacity:1; transform:none; filter:none; } }
      @keyframes nvFloat { 0%,100% { transform: translate3d(0,-6px,0);} 50% { transform: translate3d(0,8px,0);} }
      @keyframes nvTurn { 0%,100% { transform: rotateY(-30deg);} 50% { transform: rotateY(30deg);} }
      @keyframes nvBreathe { 0%,100% { opacity:.3; } 50% { opacity:.9; } }
      @keyframes nvRing { 0% { transform: scale(.6); opacity:.55; } 100% { transform: scale(1.9); opacity:0; } }
      @keyframes nvTravel { 0% { transform: translateX(0); opacity:0;} 15% { opacity:1;} 85% { opacity:1;} 100% { transform: translateX(166px); opacity:0;} }
      @keyframes nvDash { to { stroke-dashoffset: -240; } }
      @keyframes nvSweep { 0% { transform: translateY(0);} 100% { transform: translateY(118px);} }
      @keyframes nvShake { 0%,100% { transform:translateX(0);} 25% { transform:translateX(-4px);} 50% { transform:translateX(3px);} 75% { transform:translateX(-2px);} }
      @keyframes nvDraw { to { stroke-dashoffset: 0; } }
      @keyframes nvDrift { 0%,100% { transform: translate3d(0,0,0);} 50% { transform: translate3d(4px,-8px,0);} }
      @keyframes nvWiden { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      @keyframes nvLift { 0% { transform: translateY(4px); opacity:0;} 30% { opacity:1;} 100% { transform: translateY(-30px); opacity:0;} }
      .nv-float { animation: nvFloat 10s ease-in-out infinite; }
      /* nv-cam, nv-float and nv-turn each animate transform, so they have to
         sit on separate elements: two animation shorthands on one node means
         the later rule silently cancels the earlier one. */
      .nv-stage3d { perspective: 1100px; }
      .nv-turn { animation: nvTurn 18s ease-in-out infinite; transform-style: preserve-3d; will-change: transform; }
      .nv-shake { animation: nvShake 380ms ease-in-out; }
      .nv-rule { transform-origin: left; animation: nvWiden 900ms cubic-bezier(.16,.84,.44,1) forwards; }
      .nv-btn { transition: transform 240ms cubic-bezier(.16,.84,.44,1), border-color 240ms ease, background 240ms ease, color 240ms ease; }
      .nv-opt:not(:disabled):hover { transform: translateX(5px); }
      .nv-cta:hover { transform: translateY(-2px); }
      .nv :focus-visible { outline: 1px solid ${C.bio}; outline-offset: 6px; }
      .nv-scroll::-webkit-scrollbar { width: 5px; }
      .nv-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 8px; }
      @media (prefers-reduced-motion: reduce) {
        .nv *, .nv *::before, .nv *::after {
          animation-duration: 1ms !important; animation-iteration-count: 1 !important;
          transition-duration: 1ms !important;
        }
        .nv-rise,.nv-fade,.nv-punch,.nv-cam { opacity:1 !important; transform:none !important; filter:none !important; }
        .nv-turn { animation: none !important; transform: none !important; }
        .nv-rule { transform: none !important; }
      }
    `}</style>
  );
}

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const on = (e: MediaQueryListEvent) => setR(e.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, []);
  return r;
}

interface ParallaxProps {
  depth?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}


function useIsDesktop() {
  const [d, setD] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = (e: MediaQueryListEvent) => setD(e.matches);
    setD(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, []);
  return d;
}
function ParallaxLayer({ depth = 5, children, className, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let f: number | null = null;
    const move = (e: PointerEvent) => {
      if (f) return;
      f = requestAnimationFrame(() => {
        f = null;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        el.style.transform = `perspective(1500px) rotateY(${x * depth}deg) rotateX(${-y * depth * 0.65}deg) translate3d(${x * 7}px, ${y * 5}px, 0)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); if (f) cancelAnimationFrame(f); };
  }, [depth]);
  return <div ref={ref} className={className} style={{ transition: "transform 500ms cubic-bezier(.16,.84,.44,1)", ...style }}>{children}</div>;
}

/* ---------------------------------------------------------------------------
   ATMOSPHERE — quieter than before; the type is the hero now
   ------------------------------------------------------------------------- */
function ParticleField({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf: number | null = null, w = 0, h = 0;
    interface Pt { x: number; y: number; vx: number; vy: number; r: number; p: number }
    const pts: Pt[] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(r.width, 1); h = Math.max(r.height, 1);
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const n = Math.max(14, Math.round(36 * Math.min(1, w / 900)));
    for (let i = 0; i < n; i++)
      pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .1, vy: (Math.random() - .5) * .1, r: Math.random() * 1.2 + .3, p: Math.random() * 6.28 });
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
      }
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d2 = dx * dx + dy * dy;
          if (d2 < 17000) {
            ctx.strokeStyle = `rgba(148,180,220,${(1 - Math.sqrt(d2) / 130) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      for (const p of pts) {
        ctx.fillStyle = `rgba(190,220,245,${0.3 + 0.25 * Math.sin(t / 1000 + p.p)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    if (reduced) { cancelAnimationFrame(raf); draw(0); cancelAnimationFrame(raf); raf = null; }
    window.addEventListener("resize", resize);
    return () => { if (raf) cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [reduced]);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }} />;
}

function Atmosphere({ tone, reduced }: { tone: string; reduced: boolean }) {
  return (
    <div className="fixed inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{
        background: `radial-gradient(110% 80% at 50% -12%, rgba(${rgb(tone)},0.11), transparent 58%), linear-gradient(180deg, ${C.ink}, ${C.deep} 60%, ${C.ink})`,
        transition: "background 1400ms ease",
      }} />
      <ParticleField reduced={reduced} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(100% 100% at 50% 50%, transparent 40%, rgba(3,5,11,0.78))" }} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BRAIN
   ------------------------------------------------------------------------- */
/* Lateral view of the left hemisphere. The landmarks are the ones a clinician
   would look for: the lateral (Sylvian) fissure cutting off the temporal lobe,
   the central sulcus running obliquely down from the vertex with the pre- and
   postcentral gyri either side, the intraparietal and superior/inferior
   temporal sulci, a foliated cerebellum tucked beneath the occipital lobe, and
   a brainstem with its pontine bulge. Regions light up rather than fill in. */
const CEREBRUM =
  "M 56 156 C 50 130, 60 106, 80 92 C 84 70, 110 54, 134 62 C 146 42, 178 36, 198 50 C 220 34, 252 38, 266 56 C 292 44, 322 52, 334 74 C 360 74, 380 90, 386 114 C 406 126, 418 150, 414 176 C 412 200, 398 220, 378 232 C 362 248, 338 258, 314 258 C 300 274, 278 282, 260 272 C 246 286, 220 284, 204 270 C 186 274, 164 262, 152 242 C 140 230, 132 216, 136 202 C 122 194, 106 190, 90 184 C 72 178, 56 174, 56 156 Z";
const CEREBELLUM =
  "M 292 252 C 306 234, 338 226, 368 234 C 396 242, 410 264, 404 286 C 398 306, 372 318, 342 314 C 314 310, 292 294, 292 274 Z";
const BRAINSTEM =
  "M 250 234 C 238 252, 234 268, 240 282 C 246 294, 252 300, 256 312 C 258 320, 260 326, 262 332 C 274 332, 282 326, 282 318 C 278 300, 276 284, 280 268 C 282 254, 276 244, 266 234 Z";
const SYLVIAN =
  "M 140 206 C 178 226, 234 220, 284 198 C 300 190, 314 182, 326 172";
const HIPPOCAMPUS =
  "M 180 250 C 194 226, 230 216, 260 226 C 278 232, 286 244, 284 258";
const RIM_LIGHT = "M 68 138 C 86 96, 134 52, 194 48 C 250 40, 302 54, 340 80";

/* named sulci first, then gyral texture */
const SULCI: string[] = [
  "M 250 50 C 240 84, 226 124, 214 178",
  "M 212 54 C 204 86, 194 118, 184 162",
  "M 288 56 C 280 88, 268 120, 254 170",
  "M 264 142 C 298 150, 332 148, 358 138",
  "M 100 108 C 138 94, 176 86, 212 86",
  "M 82 148 C 118 142, 156 138, 192 140",
  "M 156 232 C 194 250, 250 244, 298 222",
  "M 166 254 C 204 268, 250 264, 292 248",
  "M 366 96 C 358 120, 350 140, 344 158",
  "M 352 180 C 372 188, 388 196, 398 208",
  "M 346 212 C 364 216, 380 222, 392 230",
  "M 118 122 C 132 128, 138 140, 136 152",
  "M 168 100 C 180 108, 184 120, 182 132",
  "M 230 88 C 240 96, 242 106, 238 116",
  "M 298 92 C 310 100, 314 112, 310 124",
  "M 200 230 C 210 240, 212 248, 210 256",
  "M 258 216 C 268 226, 270 236, 266 246",
  "M 94 166 C 110 164, 122 168, 128 176",
  "M 176 244 C 186 254, 188 262, 186 270",
  "M 232 240 C 242 250, 244 258, 242 266",
  "M 300 232 C 310 240, 312 248, 308 256",
];

/* each region lights from within, so highlighting never draws a hard polygon */
const GLOW: Record<string, [number, number, number, number]> = {
  frontal: [140, 142, 116, 96],
  parietal: [280, 116, 86, 74],
  occipital: [372, 176, 80, 80],
  temporal: [228, 238, 104, 58],
};

interface BrainProps { highlight?: RegionKey | null; allLit?: boolean }

function BrainSVG({ highlight = null, allLit = false }: BrainProps) {
  const on = (k: string) => allLit || highlight === k || highlight === "all";
  return (
    <svg viewBox="0 0 460 380" className="w-full h-full" role="img"
      aria-label="Lateral view of the human brain, with the region under discussion lit">
      <defs>
        <clipPath id="nvClip"><path d={CEREBRUM} /></clipPath>
        <clipPath id="nvClipCb"><path d={CEREBELLUM} /></clipPath>
        <radialGradient id="nvFill" cx="34%" cy="26%" r="88%">
          <stop offset="0%" stopColor="#245b58" />
          <stop offset="45%" stopColor="#123138" />
          <stop offset="100%" stopColor="#08161d" />
        </radialGradient>
        <linearGradient id="nvShade" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.34)" />
        </linearGradient>
        <radialGradient id="nvLobeGlow">
          <stop offset="0%" stopColor={C.bio} stopOpacity="0.5" />
          <stop offset="55%" stopColor={C.bio} stopOpacity="0.22" />
          <stop offset="100%" stopColor={C.bio} stopOpacity="0" />
        </radialGradient>
        <filter id="nvSoft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="nvG" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="nvS" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="18" /></filter>
        <filter id="nvBlur2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>

      <g filter="url(#nvS)" opacity="0.4">
        <path d={CEREBRUM} fill={C.bio} opacity="0.12" />
      </g>

      <path d={BRAINSTEM} fill="url(#nvFill)" stroke="rgba(140,228,214,0.3)" strokeWidth="1.2" />

      <path d={CEREBELLUM} fill="url(#nvFill)"
        stroke={on("cerebellum") ? C.bio : "rgba(140,228,214,0.32)"} strokeWidth="1.2"
        style={{ transition: "stroke 800ms ease" }} />
      <g clipPath="url(#nvClipCb)">
        <ellipse cx="350" cy="272" rx="66" ry="46" fill="url(#nvLobeGlow)" filter="url(#nvSoft)"
          style={{ opacity: on("cerebellum") ? 1 : 0, transition: "opacity 900ms ease" }} />
        <g key="0">
          <path d="M 292 258 C 328 242, 374 248, 408 266" fill="none" stroke="rgba(2,12,16,0.45)" strokeWidth="2.3" />
          <path d="M 292 255 C 328 239, 374 245, 408 263" fill="none" stroke="rgba(170,245,232,0.13)" strokeWidth="1" />
        </g>
        <g key="1">
          <path d="M 295 268 C 329 252, 372 258, 405 275" fill="none" stroke="rgba(2,12,16,0.45)" strokeWidth="2.3" />
          <path d="M 295 265 C 329 249, 372 255, 405 272" fill="none" stroke="rgba(170,245,232,0.13)" strokeWidth="1" />
        </g>
        <g key="2">
          <path d="M 298 278 C 330 262, 370 268, 402 284" fill="none" stroke="rgba(2,12,16,0.45)" strokeWidth="2.3" />
          <path d="M 298 275 C 330 259, 370 265, 402 281" fill="none" stroke="rgba(170,245,232,0.13)" strokeWidth="1" />
        </g>
        <g key="3">
          <path d="M 301 288 C 331 272, 368 278, 399 293" fill="none" stroke="rgba(2,12,16,0.45)" strokeWidth="2.3" />
          <path d="M 301 285 C 331 269, 368 275, 399 290" fill="none" stroke="rgba(170,245,232,0.13)" strokeWidth="1" />
        </g>
        <g key="4">
          <path d="M 304 298 C 332 282, 366 288, 396 302" fill="none" stroke="rgba(2,12,16,0.45)" strokeWidth="2.3" />
          <path d="M 304 295 C 332 279, 366 285, 396 299" fill="none" stroke="rgba(170,245,232,0.13)" strokeWidth="1" />
        </g>
        <g key="5">
          <path d="M 307 308 C 333 292, 364 298, 393 311" fill="none" stroke="rgba(2,12,16,0.45)" strokeWidth="2.3" />
          <path d="M 307 305 C 333 289, 364 295, 393 308" fill="none" stroke="rgba(170,245,232,0.13)" strokeWidth="1" />
        </g>
        <path d={CEREBELLUM} fill="url(#nvShade)" />
      </g>

      <path d={CEREBRUM} fill="url(#nvFill)" />
      <g clipPath="url(#nvClip)">
        <g filter="url(#nvSoft)">
          {Object.keys(GLOW).map((k) => (
            <ellipse key={k} cx={GLOW[k][0]} cy={GLOW[k][1]} rx={GLOW[k][2]} ry={GLOW[k][3]}
              fill="url(#nvLobeGlow)"
              style={{ opacity: on(k) ? 1 : 0, transition: "opacity 900ms ease" }} />
          ))}
        </g>

        {SULCI.map((d, i) => (
          <path key={`d${i}`} d={d} fill="none" stroke="rgba(2,12,16,0.55)" strokeWidth="3.4" strokeLinecap="round" />
        ))}
        <g transform="translate(0,-2.4)">
          {SULCI.map((d, i) => (
            <path key={`l${i}`} d={d} fill="none" stroke="rgba(170,248,232,0.16)" strokeWidth="1.2" strokeLinecap="round" />
          ))}
        </g>

        <path d={SYLVIAN} fill="none" stroke="rgba(2,10,14,0.75)" strokeWidth="6.5" strokeLinecap="round" />
        <path d={SYLVIAN} fill="none" stroke="rgba(170,248,232,0.18)" strokeWidth="1.3" strokeLinecap="round" transform="translate(0,-3.6)" />

        <g style={{ opacity: on("hippocampus") ? 1 : 0, transition: "opacity 900ms ease" }}>
          <path d={HIPPOCAMPUS} fill="none" stroke={C.bio} strokeWidth="6" strokeLinecap="round" filter="url(#nvG)" />
          <circle cx="180" cy="250" r="5" fill={C.bio} filter="url(#nvG)" />
        </g>

        <path d={CEREBRUM} fill="url(#nvShade)" />
      </g>

      <path d={CEREBRUM} fill="none" stroke={allLit ? C.bio : "rgba(150,235,220,0.45)"} strokeWidth="1.4"
        style={{ transition: "stroke 900ms ease" }} />
      <path d={RIM_LIGHT} fill="none" stroke="rgba(214,255,246,0.3)" strokeWidth="2.4"
        strokeLinecap="round" filter="url(#nvBlur2)" />

      {[[148, 140], [212, 90], [284, 104], [246, 152], [330, 140], [200, 240], [268, 214]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={C.bio}
          style={{ animation: `nvBreathe ${3 + i * 0.4}s ease-in-out ${i * 0.35}s infinite` }} />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   SCENES — violet whenever the subject is artificial
   ------------------------------------------------------------------------- */
function NeuronSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="nvN" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id="nvSoma" cx="40%" cy="35%"><stop offset="0%" stopColor="#9df5e4" /><stop offset="70%" stopColor="#12564f" /><stop offset="100%" stopColor="#0a2320" /></radialGradient>
      </defs>
      {["M 108 150 C 78 118, 56 108, 32 96", "M 108 150 C 76 140, 54 138, 28 132", "M 108 152 C 78 164, 58 178, 34 190", "M 112 140 C 100 112, 90 92, 76 66", "M 112 162 C 100 190, 92 214, 82 238"].map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="rgba(94,234,212,0.5)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx={[32, 28, 34, 76, 82][i]} cy={[96, 132, 190, 66, 238][i]} r="3.4" fill={C.bio} style={{ animation: `nvBreathe ${2.4 + i * .4}s ease-in-out infinite` }} />
        </g>
      ))}
      <circle cx="126" cy="152" r="26" fill="url(#nvSoma)" filter="url(#nvN)" />
      <circle cx="126" cy="152" r="26" fill="none" stroke={C.bio} strokeWidth="1.3" />
      <circle cx="126" cy="152" r="26" fill="none" stroke={C.bio} strokeWidth="1" style={{ transformOrigin: "126px 152px", animation: "nvRing 2.6s ease-out infinite" }} />
      <line x1="152" y1="156" x2="326" y2="156" stroke="rgba(94,234,212,0.36)" strokeWidth="5" strokeLinecap="round" />
      {[172, 210, 248, 286].map((x, i) => <ellipse key={i} cx={x} cy="156" rx="15" ry="8.5" fill="rgba(94,234,212,0.1)" stroke="rgba(94,234,212,0.3)" strokeWidth="1" />)}
      {[0, 1].map((i) => <circle key={i} cx="158" cy="156" r="4.5" fill="#d9fff6" filter="url(#nvN)" style={{ animation: `nvTravel 2.6s linear ${i * 1.3}s infinite` }} />)}
      {["M 326 156 C 348 140, 358 128, 372 112", "M 326 156 C 350 156, 362 156, 380 154", "M 326 156 C 348 172, 356 186, 370 202"].map((d, i) => (
        <g key={i}><path d={d} fill="none" stroke="rgba(94,234,212,0.45)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx={[372, 380, 370][i]} cy={[112, 154, 202][i]} r="3.6" fill={C.bio} /></g>
      ))}
      <text x="16" y="276" fill={C.faint} fontSize="9.5" letterSpacing="2.5">MANY IN</text>
      <text x="330" y="276" fill={C.faint} fontSize="9.5" letterSpacing="2.5">ONE OUT</text>
    </svg>
  );
}

function SynapseSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs><filter id="nvSy" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {[[0, 2, .22], [1, 5, .45], [2, 11, .95]].map(([i, w, o]) => (
        <g key={i} transform={`translate(0, ${52 + i * 78})`}>
          <circle cx="92" cy="0" r="16" fill="rgba(94,234,212,0.1)" stroke="rgba(94,234,212,0.45)" strokeWidth="1.3" />
          <circle cx="288" cy="0" r="16" fill="rgba(94,234,212,0.1)" stroke="rgba(94,234,212,0.45)" strokeWidth="1.3" />
          <line x1="110" y1="0" x2="270" y2="0" stroke={`rgba(94,234,212,${o})`} strokeWidth={w} strokeLinecap="round" filter={i === 2 ? "url(#nvSy)" : undefined} />
          {i === 2 && [0, 1].map((k) => <circle key={k} cx="116" cy="0" r="3.6" fill="#eafff9" style={{ animation: `nvTravel 2s linear ${k * .7}s infinite` }} />)}
        </g>
      ))}
      <text x="92" y="286" fill={C.faint} fontSize="9.5" letterSpacing="2.5">USE IT AND THE CONNECTION STRENGTHENS</text>
    </svg>
  );
}

function NetworkSVG({ layers = [4, 7, 7, 7, 3] }: { layers?: number[] }) {
  const W = 400, H = 300;
  const cols = layers.map((n, li) => {
    const x = 58 + (li * (W - 116)) / (layers.length - 1);
    return Array.from({ length: n }, (_, i) => ({ x, y: H / 2 + (i - (n - 1) / 2) * 29 }));
  });
  const edges: { a: { x: number; y: number }; b: { x: number; y: number }; k: string }[] = [];
  for (let l = 0; l < cols.length - 1; l++)
    cols[l].forEach((a, i) => cols[l + 1].forEach((b, j) => edges.push({ a, b, k: `${l}-${i}-${j}` })));
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs><filter id="nvNet" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {edges.map((e, i) => (
        <line key={e.k} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} stroke={`rgba(${rgb(C.ai)},0.16)`} strokeWidth="0.85" strokeDasharray="6 10" style={{ animation: `nvDash ${4 + (i % 5)}s linear infinite` }} />
      ))}
      {cols.map((col, li) => col.map((p, i) => (
        <circle key={`${li}-${i}`} cx={p.x} cy={p.y} r="5" fill={C.ai} filter="url(#nvNet)"
          style={{ animation: `nvBreathe ${2.4 + ((li + i) % 4) * .5}s ease-in-out ${li * .25 + i * .1}s infinite` }} />
      )))}
      <text x="20" y="288" fill={C.faint} fontSize="9.5" letterSpacing="2.5">SIMPLE</text>
      <text x="322" y="288" fill={C.faint} fontSize="9.5" letterSpacing="2.5">COMPLEX</text>
    </svg>
  );
}

function DataSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="nvD" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="nvFun" x1="0" x2="1"><stop offset="0%" stopColor={`rgba(${rgb(C.ai)},0.03)`} /><stop offset="100%" stopColor={`rgba(${rgb(C.ai)},0.22)`} /></linearGradient>
      </defs>
      {Array.from({ length: 9 }).map((_, r) => Array.from({ length: 5 }).map((_, c) => (
        <rect key={`${r}-${c}`} x={22 + c * 22} y={38 + r * 25} width="16" height="8" rx="2" fill={C.ai}
          style={{ opacity: .14 + ((r + c) % 4) * .12, animation: `nvBreathe ${2 + ((r * 5 + c) % 6) * .4}s ease-in-out ${r * .08 + c * .1}s infinite` }} />
      )))}
      <path d="M 150 44 L 246 118 L 246 182 L 150 256 Z" fill="url(#nvFun)" stroke={`rgba(${rgb(C.ai)},0.3)`} strokeWidth="1.1" />
      {[104, 150, 196].map((y, i) => (
        <g key={i}>
          <line x1="252" y1={y} x2="322" y2={y} stroke={`rgba(${rgb(C.ai)},0.4)`} strokeWidth="1.3" strokeDasharray="5 7" style={{ animation: `nvDash ${3 + i}s linear infinite` }} />
          <circle cx="332" cy={y} r="6.5" fill={C.ai} filter="url(#nvD)" style={{ animation: `nvBreathe ${2.6 + i * .5}s ease-in-out infinite` }} />
        </g>
      ))}
      <text x="20" y="26" fill={C.faint} fontSize="9.5" letterSpacing="2.5">EXAMPLES WITH ANSWERS</text>
      <text x="292" y="236" fill={C.faint} fontSize="9.5" letterSpacing="2.5">PREDICTION</text>
    </svg>
  );
}

function VisionSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="nvV" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <clipPath id="nvPlate"><rect x="50" y="66" width="150" height="160" rx="6" /></clipPath>
      </defs>
      <rect x="50" y="66" width="150" height="160" rx="6" fill={`rgba(${rgb(C.ai)},0.05)`} stroke={`rgba(${rgb(C.ai)},0.28)`} strokeWidth="1.1" />
      <g clipPath="url(#nvPlate)" opacity="0.55">
        {Array.from({ length: 8 }).map((_, i) => (
          <path key={i} d={`M ${58 + i * 4} ${96 + i * 14} C ${108 + i * 3} ${88 + i * 14}, 148 ${102 + i * 13}, 194 ${94 + i * 15}`} stroke={`rgba(${rgb(C.ai)},0.34)`} strokeWidth="1.3" fill="none" />
        ))}
        <rect x="50" y="66" width="150" height="9" fill={`rgba(${rgb(C.ai)},0.3)`} style={{ animation: "nvSweep 3.6s ease-in-out infinite alternate" }} />
      </g>
      <rect x="114" y="128" width="46" height="42" rx="3" fill="none" stroke={C.ai} strokeWidth="1.8" strokeDasharray="180" strokeDashoffset="180" style={{ animation: "nvDraw 1.4s ease-out .8s forwards" }} />
      {["EDGES", "PARTS", "WHAT IT IS"].map((l, i) => (
        <g key={l}>
          <line x1="238" y1={82 + i * 56} x2="368" y2={82 + i * 56} stroke={`rgba(${rgb(C.ai)},${.18 + i * .16})`} strokeWidth="1" />
          <text x="238" y={74 + i * 56} fill={i === 2 ? C.text : C.muted} fontSize="11" letterSpacing="3">{l}</text>
        </g>
      ))}
      <text x="238" y="252" fill={C.faint} fontSize="9.5" letterSpacing="2.5">FAILS ONLY AT THE LAST STAGE</text>
    </svg>
  );
}

function LanguageSVG() {
  const words: [string, number, number][] = [
    ["fluent", 52, 56], ["confident", 148, 42], ["plausible", 268, 62],
    ["ungrounded", 46, 122], ["wrong", 208, 118],
  ];
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      {words.map(([w, x, y], i) => (
        <g key={w} style={{ animation: `nvDrift ${7 + i}s ease-in-out ${i * .3}s infinite` }}>
          <rect x={x - 9} y={y - 15} width={String(w).length * 8 + 20} height="25" rx="12.5" fill={`rgba(${rgb(C.ai)},0.06)`} stroke={`rgba(${rgb(C.ai)},0.3)`} strokeWidth="1" />
          <text x={x} y={y + 3} fill={C.text} fontSize="12">{w}</text>
        </g>
      ))}
      {[[112, 54, 144, 46], [232, 48, 264, 58], [110, 120, 204, 118]].map(([a, b, c, d], i) => (
        <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={`rgba(${rgb(C.ai)},0.26)`} strokeWidth="1.1" strokeDasharray="4 6" style={{ animation: `nvDash ${3 + i}s linear infinite` }} />
      ))}
      <line x1="52" y1="176" x2="348" y2="176" stroke={C.line} strokeWidth="1" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="52" y={196 + i * 16} width={280 - i * 70} height="6" rx="3" fill="rgba(232,238,247,0.26)" style={{ animation: `nvBreathe ${2.4 + i * .6}s ease-in-out ${i * .4}s infinite` }} />
      ))}
      <text x="52" y="272" fill={C.faint} fontSize="9.5" letterSpacing="2.5">CORRECT AND INCORRECT LOOK IDENTICAL</text>
    </svg>
  );
}

function MemorySVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs><filter id="nvM" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <path d="M 76 176 C 110 134, 176 118, 226 140" fill="none" stroke={C.bio} strokeWidth="9" strokeLinecap="round" opacity="0.75" filter="url(#nvM)" />
      <text x="76" y="212" fill={C.faint} fontSize="9.5" letterSpacing="2.5">WHAT IT ALREADY KNEW</text>
      <g opacity="0.9">
        <rect x="264" y="96" width="88" height="104" rx="5" fill={`rgba(${rgb(C.ai)},0.05)`} stroke={`rgba(${rgb(C.ai)},0.4)`} strokeWidth="1.2" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="280" y={118 + i * 16} width={56 - i * 7} height="4.5" rx="2" fill={`rgba(${rgb(C.ai)},0.55)`} />)}
      </g>
      <path d="M 232 148 C 246 140, 254 132, 262 128" fill="none" stroke={`rgba(${rgb(C.ai)},0.5)`} strokeWidth="1.4" strokeDasharray="4 6" style={{ animation: "nvDash 3s linear infinite" }} />
      <path d="M 262 176 C 252 184, 242 190, 232 194" fill="none" stroke={`rgba(${rgb(C.ai)},0.5)`} strokeWidth="1.4" strokeDasharray="4 6" style={{ animation: "nvDash 3.6s linear infinite" }} />
      <text x="252" y="232" fill={C.faint} fontSize="9.5" letterSpacing="2.5">LOOKED UP, THEN CITED</text>
    </svg>
  );
}

function AgentSVG() {
  const tools = ["SEARCH", "CALC", "READ", "UPDATE", "RUN"];
  const R = 96;
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="nvA" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id="nvCore" cx="40%" cy="35%"><stop offset="0%" stopColor="#d6ccff" /><stop offset="70%" stopColor="#5b3fb8" /><stop offset="100%" stopColor="#2a1a58" /></radialGradient>
      </defs>
      <circle cx="200" cy="150" r={R} fill="none" stroke={`rgba(${rgb(C.ai)},0.13)`} strokeWidth="1" strokeDasharray="3 9" />
      {tools.map((t, i) => {
        const a = (i / tools.length) * 6.2832 - Math.PI / 2;
        const x = 200 + Math.cos(a) * R, y = 150 + Math.sin(a) * R;
        return (
          <g key={t}>
            <line x1="200" y1="150" x2={x} y2={y} stroke={`rgba(${rgb(C.ai)},0.24)`} strokeWidth="1.1" strokeDasharray="5 8" style={{ animation: `nvDash ${3 + i * .7}s linear infinite` }} />
            <circle cx={x} cy={y} r="18" fill="rgba(12,10,28,0.9)" stroke={`rgba(${rgb(C.ai)},0.38)`} strokeWidth="1.1" />
            <text x={x} y={y + 3} fill={C.muted} fontSize="7.5" textAnchor="middle" letterSpacing="1">{t}</text>
          </g>
        );
      })}
      <circle cx="200" cy="150" r="31" fill="url(#nvCore)" filter="url(#nvA)" />
      <circle cx="200" cy="150" r="31" fill="none" stroke={C.ai} strokeWidth="1.2" />
      <circle cx="200" cy="150" r="31" fill="none" stroke={C.ai} strokeWidth="1" style={{ transformOrigin: "200px 150px", animation: "nvRing 3.2s ease-out infinite" }} />
      <text x="136" y="288" fill={C.faint} fontSize="9.5" letterSpacing="2.5">ACT · LOOK · CORRECT</text>
    </svg>
  );
}

function Scene({ scene, region }: { scene: SceneKey; region: RegionKey | null }) {
  switch (scene) {
    case "neuron": return <NeuronSVG />;
    case "synapse": return <SynapseSVG />;
    case "data": return <DataSVG />;
    case "deep": return <NetworkSVG />;
    case "vision": return <VisionSVG />;
    case "language": return <LanguageSVG />;
    case "memory": return <MemorySVG />;
    case "agent": return <AgentSVG />;
    case "unified": return <BrainSVG allLit />;
    default: return <BrainSVG highlight={region} />;
  }
}

/* ---------------------------------------------------------------------------
   SMALL UI
   ------------------------------------------------------------------------- */
function Label({ children, color = C.faint }: { children: React.ReactNode; color?: string }) {
  return <div style={{ color, fontSize: 10, letterSpacing: "0.28em", fontWeight: 500 }}>{children}</div>;
}

interface ProseProps { children: React.ReactNode; size?: number; color?: string }

function Prose({ children, size = 17, color = C.body }: ProseProps) {
  return (
    <p className="nv-prose" style={{ color, fontSize: `clamp(15.5px, 2.1vw, ${size}px)`, lineHeight: 1.75, maxWidth: "34em", marginTop: 16 }}>
      {children}
    </p>
  );
}

interface CtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: string;
  subtle?: boolean;
}

function Cta({ children, onClick, tone = C.bio, subtle, ...rest }: CtaProps) {
  return (
    <button onClick={onClick} className="nv-btn nv-cta" style={{
      padding: subtle ? "11px 20px" : "14px 26px",
      borderRadius: 2, cursor: "pointer",
      fontSize: 11.5, letterSpacing: "0.22em", fontWeight: 600,
      color: subtle ? C.muted : C.ink,
      background: subtle ? "transparent" : tone,
      border: subtle ? `1px solid ${C.line}` : "none",
    }} {...rest}>{children}</button>
  );
}

/* ---------------------------------------------------------------------------
   INTRO
   ------------------------------------------------------------------------- */
function Intro({ onBegin, reduced }: { onBegin: () => void; reduced: boolean }) {
  const [stage, setStage] = useState(reduced ? 2 : 0);
  useEffect(() => {
    if (reduced) return;
    const t = [1700, 3400].map((ms, i) => setTimeout(() => setStage(i + 1), ms));
    return () => t.forEach(clearTimeout);
  }, [reduced]);
  return (
    <div className="relative nv-screen w-full flex flex-col items-center justify-center px-6 py-16"
      style={{ overflow: "hidden" }}>
      <ParallaxLayer depth={6} className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: "none" }}>
        <div className="nv-float" style={{ width: "min(700px, 112vw)", opacity: stage >= 1 ? 0.72 : 0.3, transition: "opacity 2000ms ease" }}>
          <BrainSVG highlight={stage >= 2 ? "all" : null} />
        </div>
      </ParallaxLayer>
      <div className="relative text-center" style={{ maxWidth: 680 }}>
        <h1 style={{
          fontSize: "clamp(38px,9vw,92px)", lineHeight: 1, fontWeight: 200, letterSpacing: "-0.03em", color: "#f2f8ff",
          opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "none" : "scale(1.05)",
          transition: "all 1500ms cubic-bezier(.16,.84,.44,1)",
        }}>
          Neuroverse
        </h1>
        <div className="nv-fade" style={{ marginTop: 20, color: C.bio, fontSize: 10.5, letterSpacing: "0.34em" }}>
          TEN QUESTIONS ABOUT THE BRAIN
        </div>
        <div style={{
          marginTop: 26, opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? "none" : "translateY(16px)",
          transition: "all 1100ms cubic-bezier(.16,.84,.44,1)",
        }}>
          <p className="nv-prose" style={{ color: C.body, fontSize: "clamp(16px,2.4vw,19px)", lineHeight: 1.7, maxWidth: "30em", margin: "0 auto" }}>
            For four billion years, intelligence had exactly one design. The
            second one arrived within a single lifetime, built by people
            looking very closely at the first.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Cta onClick={onBegin} autoFocus>BEGIN</Cta>
            <span style={{ color: C.faint, fontSize: 10, letterSpacing: "0.22em" }}>TEN CHAPTERS · TWELVE MINUTES</span>
          </div>
        </div>
        {stage < 2 && (
          <button onClick={() => setStage(2)} className="nv-btn" style={{ marginTop: 32, background: "none", border: "none", color: C.faint, fontSize: 10, letterSpacing: "0.24em", cursor: "pointer" }}>
            SKIP
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   CHAPTER TITLE BEAT
   ------------------------------------------------------------------------- */
function ChapterCard({ ch, onDone, reduced }: { ch: Chapter; onDone: () => void; reduced: boolean }) {
  useEffect(() => {
    if (reduced) { onDone(); return; }
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone, reduced]);
  return (
    <button onClick={onDone} aria-label="Continue" className="fixed inset-0 z-40 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "rgba(5,7,14,0.9)", border: "none", cursor: "pointer" }}>
      <div className="nv-fade" style={{ color: C.bio, fontSize: 10.5, letterSpacing: "0.46em" }}>{ch.n}</div>
      <div className="nv-punch" style={{ marginTop: 16, color: "#f2f8ff", fontSize: "clamp(30px,7vw,62px)", fontWeight: 200, letterSpacing: "-0.03em" }}>
        {ch.title}
      </div>
      <p className="nv-prose nv-rise" style={{ marginTop: 20, color: C.muted, fontSize: "clamp(15px,2.3vw,18px)", maxWidth: "28em", lineHeight: 1.65, animationDelay: "420ms" }}>
        {ch.hook}
      </p>
    </button>
  );
}

/* ---------------------------------------------------------------------------
   QUESTION
   ------------------------------------------------------------------------- */
const LETTERS = ["A", "B", "C", "D"];

interface QuestionProps {
  ch: Chapter;
  index: number;
  selected: number | null;
  onSelect: (i: number) => void;
}

function QuestionBlock({ ch, index, selected, onSelect }: QuestionProps) {
  const answered = selected !== null;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (answered) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= ch.options.length) onSelect(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, onSelect, ch.options.length]);

  return (
    <div>
      <Label color={C.bio}>{String(index + 1).padStart(2, "0")} — {ch.title.toUpperCase()}</Label>
      <h2 className="nv-prose nv-rise" style={{
        marginTop: 16, color: "#f2f8ff", fontWeight: 400,
        fontSize: answered ? "clamp(16px,2.3vw,19px)" : "clamp(20px,3.2vw,28px)",
        lineHeight: 1.4, maxWidth: "26em", transition: "font-size 500ms ease",
      }}>
        {ch.question}
      </h2>

      <div className="mt-7" style={{ borderTop: `1px solid ${C.line}` }}>
        {ch.options.map((opt, i) => {
          const isCorrect = i === ch.correct;
          const picked = selected === i;
          if (answered && !isCorrect && !picked) return null;
          return (
            <button key={opt} disabled={answered} onClick={() => onSelect(i)}
              className={`nv-btn nv-opt text-left ${answered && picked && !isCorrect ? "nv-shake" : "nv-rise"}`}
              style={{
                animationDelay: answered ? "0ms" : `${140 + i * 70}ms`,
                display: "flex", alignItems: "baseline", gap: 16, width: "100%",
                padding: "16px 4px", background: "none", cursor: answered ? "default" : "pointer",
                borderTop: "none", borderLeft: "none", borderRight: "none",
                borderBottom: `1px solid ${answered && isCorrect ? `rgba(${rgb(C.bio)},0.5)` : C.line}`,
                color: answered && isCorrect ? C.text : answered ? C.faint : C.body,
              }}>
              <span style={{ flexShrink: 0, fontSize: 10.5, letterSpacing: "0.2em", color: answered && isCorrect ? C.bio : C.faint, width: 16 }}>
                {answered && isCorrect ? "✓" : LETTERS[i]}
              </span>
              <span className="nv-prose" style={{ fontSize: "clamp(15px,2.2vw,17px)", lineHeight: 1.5 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {!answered && (
        <p className="mt-5" style={{ color: C.faint, fontSize: 10, letterSpacing: "0.18em" }}>
          ANSWER FROM WHAT YOU ALREADY KNOW
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   REVEAL — verdict, one paragraph of brain, then one idea
   ------------------------------------------------------------------------- */
interface RevealProps {
  ch: Chapter;
  correct: boolean;
  streak: number;
  onContinue: () => void;
  isLast: boolean;
  reduced: boolean;
}

function Reveal({ ch, correct, streak, onContinue, isLast, reduced }: RevealProps) {
  const [step, setStep] = useState(reduced ? 2 : 0);
  useEffect(() => {
    if (reduced) return;
    const t = [700, 1900].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => t.forEach(clearTimeout);
  }, [reduced]);

  return (
    <div className="mt-9">
      {/* verdict — one line, no box */}
      <div className="flex items-center gap-4" style={{ position: "relative" }}>
        <span style={{ color: correct ? C.bio : C.muted, fontSize: 10.5, letterSpacing: "0.28em", fontWeight: 600 }}>
          {correct ? "CORRECT" : "THE ANSWER IS MARKED ABOVE"}
        </span>
        {correct && streak > 2 && (
          <span style={{ color: C.faint, fontSize: 10, letterSpacing: "0.2em" }}>{streak} IN A ROW</span>
        )}
        {correct && !reduced && (
          <span aria-hidden="true" style={{ color: C.bio, fontSize: 10, letterSpacing: "0.18em", animation: "nvLift 1300ms ease-out forwards" }}>+1</span>
        )}
      </div>

      {step >= 1 && (
        <div className="nv-rise mt-7">
          <Label color={C.bio}>WHAT YOU JUST DESCRIBED</Label>
          <Prose>{ch.brain}</Prose>
        </div>
      )}

      {step >= 2 && (
        <div className="mt-12">
          <div className="nv-rule" style={{ height: 1, background: `linear-gradient(90deg, ${C.ai}, rgba(167,139,250,0))` }} />
          <p className="nv-prose nv-punch" style={{
            marginTop: 26, color: "#f2f8ff", fontSize: "clamp(19px,3vw,27px)",
            fontWeight: 400, lineHeight: 1.42, maxWidth: "22em", letterSpacing: "-0.01em",
          }}>
            {ch.bridge}
          </p>

          <div className="nv-rise" style={{ marginTop: 34, animationDelay: "260ms" }}>
            <Label color={C.ai}>{ch.name.toUpperCase()}</Label>
            {ch.teach.map((p, i) => <Prose key={i} size={18} color={i === 0 ? C.text : C.body}>{p}</Prose>)}
          </div>

          <div className="nv-rise" style={{ marginTop: 34, paddingTop: 18, borderTop: `1px solid ${C.line}`, animationDelay: "420ms", maxWidth: "34em" }}>
            <Label>WORTH KNOWING</Label>
            <p className="nv-prose" style={{ color: C.muted, fontSize: "clamp(14px,1.9vw,15.5px)", lineHeight: 1.7, marginTop: 12 }}>
              {ch.note}
            </p>
          </div>

          <div className="nv-rise mt-11" style={{ paddingBottom: 48, animationDelay: "560ms" }}>
            <Cta onClick={onContinue} tone={C.ai}>{isLast ? "SEE THE WHOLE PICTURE" : "NEXT"}</Cta>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   JOURNEY
   ------------------------------------------------------------------------- */
interface JourneyProps {
  onFinish: () => void;
  reduced: boolean;
  stats: React.MutableRefObject<Stats>;
}

function Journey({ onFinish, reduced, stats }: JourneyProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(true);
  const desktop = useIsDesktop();
  const ch = CHAPTERS[index];
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const questionRef = useRef<HTMLDivElement | null>(null);

  const select = useCallback((i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === CHAPTERS[index].correct) {
      stats.current.score += 1;
      stats.current.streak += 1;
      stats.current.best = Math.max(stats.current.best, stats.current.streak);
    } else stats.current.streak = 0;
    if (!reduced)
      setTimeout(() => questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 480);
  }, [index, selected, stats, reduced]);

  const next = useCallback(() => {
    if (index === CHAPTERS.length - 1) { onFinish(); return; }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowCard(true);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [index, onFinish]);

  const answered = selected !== null;
  const sceneKey = answered ? ch.scene : ch.region ? "brain" : ch.scene;
  const revolving = sceneKey === "brain" || sceneKey === "unified";

  return (
    <div className="relative nv-screen w-full flex flex-col"
      style={{ height: desktop ? "100dvh" : undefined, overflow: desktop ? "hidden" : undefined }}>
      {showCard && <ChapterCard ch={ch} reduced={reduced} onDone={() => setShowCard(false)} />}

      <header className="relative z-20 flex items-center justify-between px-5 sm:px-10"
        style={{ paddingTop: 22, paddingBottom: 16, flexShrink: 0 }}>
        <span style={{ color: C.text, fontSize: 11.5, letterSpacing: "0.28em", fontWeight: 500 }}>NEUROVERSE</span>
        <div className="flex items-center gap-3">
          <span style={{ color: C.faint, fontSize: 10, letterSpacing: "0.2em" }}>
            {String(index + 1).padStart(2, "0")} / 10
          </span>
          <div className="flex items-center" style={{ gap: 3 }}>
            {CHAPTERS.map((c, i) => (
              <span key={c.n} style={{
                width: i === index ? 16 : 5, height: 2,
                background: i < index ? `rgba(${rgb(C.ai)},0.8)` : i === index ? C.bio : "rgba(255,255,255,0.14)",
                transition: "all 600ms cubic-bezier(.16,.84,.44,1)",
              }} />
            ))}
          </div>
        </div>
      </header>

      <div className="w-full grid grid-cols-1 lg:grid-cols-5" style={{ flex: 1, minHeight: 0 }}>
        {/* On a laptop this pane holds still while the text scrolls beside it.
            On a phone it is a compact banner in normal flow, sized off the
            viewport height so it never eats the screen. */}
        <div className="relative lg:col-span-2 flex flex-col items-center justify-center"
          style={{ minHeight: 0, padding: desktop ? "0 24px" : "2px 16px 12px" }}>
          <ParallaxLayer depth={desktop ? 4 : 0} className="w-full flex items-center justify-center">
            <div key={`${index}-${answered}`} className="nv-cam nv-stage3d"
              style={{ width: desktop ? "min(430px, 100%, 46vh)" : "min(300px, 62vw, 30vh)" }}>
              <div className="nv-float">
                <div className={revolving ? "nv-turn" : undefined}>
                  <Scene scene={sceneKey} region={ch.region} />
                </div>
              </div>
            </div>
          </ParallaxLayer>
          <div className="mt-2" style={{ color: C.faint, fontSize: 9.5, letterSpacing: "0.26em" }}>
            {answered ? ch.name.toUpperCase() : ch.region ? "THE BRAIN" : ch.title.toUpperCase()}
          </div>
        </div>

        <div ref={scrollRef} className="nv-scroll lg:col-span-3 px-5 sm:px-10 lg:pr-16"
          style={{
            overflowY: desktop ? "auto" : "visible",
            minHeight: 0,
            paddingBottom: desktop ? 40 : 92,
          }}>
          <div style={{ maxWidth: 660 }}>
            <div ref={questionRef}>
              <QuestionBlock ch={ch} index={index} selected={selected} onSelect={select} />
            </div>
            <div>
              {answered && (
                <Reveal key={index} ch={ch} correct={selected === ch.correct} streak={stats.current.streak}
                  reduced={reduced} isLast={index === CHAPTERS.length - 1} onContinue={next} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   FINAL
   ------------------------------------------------------------------------- */
interface FinalProps { stats: { score: number }; onRestart: () => void; reduced: boolean }

function Final({ stats, onRestart, reduced }: FinalProps) {
  const [lit, setLit] = useState(reduced ? PICTURE.length : 0);
  const [stage, setStage] = useState(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    const ids = PICTURE.map((_, i) => setTimeout(() => setLit(i + 1), 750 * (i + 1)));
    const s = setTimeout(() => setStage(1), 750 * PICTURE.length + 600);
    return () => { ids.forEach(clearTimeout); clearTimeout(s); };
  }, [reduced]);

  return (
    <div className="relative nv-screen w-full flex flex-col items-center px-5 sm:px-10 py-16"
      style={{ overflowX: "hidden" }}>
      <ParallaxLayer depth={3} className="absolute inset-0 flex items-start justify-center pt-32" style={{ pointerEvents: "none" }}>
        <div className="nv-float" style={{ width: "min(540px, 100vw)", opacity: 0.12 }}><BrainSVG allLit /></div>
      </ParallaxLayer>

      <div className="relative w-full" style={{ maxWidth: 640 }}>
        <Label color={C.ai}>THE WHOLE PICTURE</Label>
        <h1 className="nv-prose" style={{
          marginTop: 18, fontSize: "clamp(24px,4.4vw,40px)", fontWeight: 400,
          lineHeight: 1.2, color: "#f2f8ff", letterSpacing: "-0.02em", maxWidth: "14em",
        }}>
          This is all artificial intelligence is.
        </h1>

        {/* the spine */}
        <div style={{
          marginTop: 44, paddingLeft: 30,
          borderLeft: `1px solid rgba(${rgb(C.ai)},0.22)`,
        }}>
          {PICTURE.map((p, i) => (
            <div key={p.k} style={{
              position: "relative", paddingBottom: i === PICTURE.length - 1 ? 0 : 34,
              opacity: i < lit ? 1 : 0.14,
              transform: i < lit ? "none" : "translateY(8px)",
              transition: "opacity 800ms ease, transform 800ms cubic-bezier(.16,.84,.44,1)",
            }}>
              <span aria-hidden="true" style={{
                position: "absolute", left: -34.5, top: 6, width: 9, height: 9, borderRadius: 99,
                background: i < lit ? C.ai : "rgba(255,255,255,0.12)",
                boxShadow: i < lit ? `0 0 12px rgba(${rgb(C.ai)},0.7)` : "none",
                transition: "all 800ms ease",
              }} />
              <div style={{ color: i < lit ? C.ai : C.faint, fontSize: 10, letterSpacing: "0.26em", fontWeight: 500, transition: "color 800ms ease" }}>
                {p.k.toUpperCase()}
              </div>
              <p className="nv-prose" style={{
                marginTop: 9, color: C.body, fontSize: "clamp(15.5px,2.2vw,17.5px)",
                lineHeight: 1.7, maxWidth: "30em",
              }}>
                {p.t}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 56,
          opacity: stage >= 1 ? 1 : 0,
          transform: stage >= 1 ? "none" : "translateY(16px)",
          transition: "all 1200ms cubic-bezier(.16,.84,.44,1)",
        }}>
          <div className="nv-rule" style={{ height: 1, background: `linear-gradient(90deg, ${C.bio}, rgba(94,234,212,0))` }} />
          <p className="nv-prose" style={{
            marginTop: 26, fontSize: "clamp(19px,3vw,27px)", lineHeight: 1.45,
            color: "#f2f8ff", maxWidth: "19em", letterSpacing: "-0.015em",
          }}>
            Twelve minutes ago, every step of that was a question about the brain.
          </p>
          <p className="nv-prose" style={{ marginTop: 18, color: C.muted, fontSize: "clamp(14.5px,2vw,16px)", lineHeight: 1.75, maxWidth: "31em" }}>
            Nothing was simplified to get you here — this is genuinely what the field is.
            The vocabulary was new. The ideas were already yours.
          </p>
          <p className="nv-prose" style={{ marginTop: 26, color: C.muted, fontSize: "clamp(14px,1.9vw,15.5px)", lineHeight: 1.75, maxWidth: "31em" }}>
            If you want to take it further: begin where an error would be obvious and
            reversible rather than with diagnosis, and ask of any tool what it was
            trained on, how it fails, and whether it can show you its source.
          </p>

          <div className="mt-14 pb-10 flex items-center gap-6 flex-wrap">
            <Cta onClick={onRestart} subtle>START AGAIN</Cta>
            <span style={{ color: C.faint, fontSize: 10, letterSpacing: "0.2em" }}>
              {stats.score} OF 10 FROM CLINICAL KNOWLEDGE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   APP
   ------------------------------------------------------------------------- */
export default function App() {
  const [phase, setPhase] = useState<"intro" | "journey" | "final">("intro");
  const [runId, setRunId] = useState(0);
  const [finalStats, setFinalStats] = useState({ score: 0, best: 0 });
  const stats = useRef<Stats>({ score: 0, streak: 0, best: 0 });
  const reduced = useReducedMotion();

  const restart = () => {
    stats.current = { score: 0, streak: 0, best: 0 };
    setFinalStats({ score: 0, best: 0 });
    setRunId((r) => r + 1);
    setPhase("intro");
  };

  return (
    <div className="nv nv-app nv-screen relative w-full" style={{ background: C.ink, color: C.text }}>
      <GlobalStyles />
      <Atmosphere tone={phase === "final" ? C.ai : C.bio} reduced={reduced} />
      <main className="relative z-10">
        {phase === "intro" && <Intro key={`i${runId}`} reduced={reduced} onBegin={() => setPhase("journey")} />}
        {phase === "journey" && (
          <Journey key={`j${runId}`} reduced={reduced} stats={stats}
            onFinish={() => { setFinalStats({ score: stats.current.score, best: stats.current.best }); setPhase("final"); }} />
        )}
        {phase === "final" && <Final key={`f${runId}`} reduced={reduced} stats={finalStats} onRestart={restart} />}
      </main>
      {phase === "journey" && (
        <button onClick={restart} className="nv-btn" style={{
          position: "fixed", right: 14, bottom: "calc(14px + env(safe-area-inset-bottom))",
          zIndex: 30, padding: "8px 14px",
          fontSize: 9.5, letterSpacing: "0.2em", color: C.faint, background: "rgba(5,7,14,0.75)",
          border: `1px solid ${C.line}`, cursor: "pointer",
        }}>START AGAIN</button>
      )}
    </div>
  );
}
