/* ============================================================================
   LIVE ROOMS

   Presentation mode has no accounts and no login. Two things stand in for auth:

   - the room code, which is public and only needs to be unguessable enough to
     stop someone wandering into the wrong talk;
   - the presenter key, which never leaves the presenter's own browser and is
     checked in the database on every slide change.

   Everything a viewer is not allowed to see — the presenter key, the raw votes,
   and the vote breakdown while the poll is still open — is unreachable from the
   browser at all. The client cannot be trusted to hide them, so it is not asked
   to: the tables deny anon access outright and the only way through is a
   security-definer function that enforces the rule itself.
   ========================================================================== */

import { createClient } from "@supabase/supabase-js";

/* The publishable key is designed to sit in browser code — it carries no
   privileges of its own, and every table it can reach is governed by RLS. */
const SUPABASE_URL = "https://xpgfqkzedwfclnkrxucs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_1OP9pjJKo2uOzfQG7VDe4g_CzyztPBM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 5 } },
});

export type Phase = "lobby" | "question" | "results" | "reveal" | "final";

export interface RoomState {
  code: string;
  chapter: number;
  phase: Phase;
  poll_ends_at: string | null;
  /* Bumped by nv_set_phase on every change. Clients use it to order updates,
     so a slow response cannot overwrite a newer one. */
  updated_at: string;
}

export interface Tally {
  choice: number;
  votes: number;
}

/* How long the room gets to answer. */
export const POLL_SECONDS = 30;

/* ---------------------------------------------------------------------------
   PRESENTER IDENTITY
   The key is the only proof of control, so it lives in localStorage and is
   re-read on load: a presenter who refreshes mid-talk, or whose phone sleeps,
   keeps the deck rather than losing the room.
   ------------------------------------------------------------------------- */
const KEY_STORE = "neuroverse.presenter";

interface PresenterCredentials { code: string; key: string }

export function loadPresenter(): PresenterCredentials | null {
  try {
    const raw = localStorage.getItem(KEY_STORE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PresenterCredentials;
    return parsed.code && parsed.key ? parsed : null;
  } catch {
    return null;
  }
}

export function savePresenter(creds: PresenterCredentials): void {
  try {
    localStorage.setItem(KEY_STORE, JSON.stringify(creds));
  } catch {
    /* Private windows refuse storage. The talk still runs; a refresh loses it. */
  }
}

export function clearPresenter(): void {
  try {
    localStorage.removeItem(KEY_STORE);
  } catch {
    /* nothing to do */
  }
}

/* ---------------------------------------------------------------------------
   VIEWER IDENTITY
   Anonymous and per-device. It exists only so one phone counts once; it is
   never shown, never sent anywhere else, and carries nothing about the person.
   ------------------------------------------------------------------------- */
const VOTER_STORE = "neuroverse.voter";

export function voterId(): string {
  try {
    const existing = localStorage.getItem(VOTER_STORE);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    localStorage.setItem(VOTER_STORE, fresh);
    return fresh;
  } catch {
    /* No storage: still vote, but a refresh will read as a new device. */
    return crypto.randomUUID();
  }
}

/* ---------------------------------------------------------------------------
   CALLS
   ------------------------------------------------------------------------- */
export async function createRoom(): Promise<PresenterCredentials> {
  const { data, error } = await supabase.rpc("nv_create_room");
  if (error) throw error;
  const row = (data as { code: string; presenter_key: string }[])[0];
  return { code: row.code, key: row.presenter_key };
}

export async function setPhase(
  creds: PresenterCredentials,
  phase: Phase,
  chapter: number,
  pollSeconds: number | null = null,
): Promise<void> {
  const { error } = await supabase.rpc("nv_set_phase", {
    p_code: creds.code,
    p_key: creds.key,
    p_phase: phase,
    p_chapter: chapter,
    p_poll_seconds: pollSeconds,
  });
  if (error) throw error;
}

export async function fetchRoom(code: string): Promise<RoomState | null> {
  const { data, error } = await supabase
    .from("nv_rooms")
    .select("code, chapter, phase, poll_ends_at, updated_at")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as RoomState) ?? null;
}

export async function castVote(code: string, chapter: number, choice: number): Promise<void> {
  const { error } = await supabase.rpc("nv_vote", {
    p_code: code,
    p_voter: voterId(),
    p_chapter: chapter,
    p_choice: choice,
  });
  if (error) throw error;
}

export async function fetchTurnout(code: string, chapter: number): Promise<number> {
  const { data, error } = await supabase.rpc("nv_turnout", { p_code: code, p_chapter: chapter });
  if (error) throw error;
  return (data as number) ?? 0;
}

/* Throws while the poll is open — by design. Callers treat that as "not yet". */
export async function fetchTally(code: string, chapter: number): Promise<Tally[]> {
  const { data, error } = await supabase.rpc("nv_tally", { p_code: code, p_chapter: chapter });
  if (error) throw error;
  return (data as Tally[]) ?? [];
}
