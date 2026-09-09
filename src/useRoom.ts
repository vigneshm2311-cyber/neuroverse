import { useEffect, useState } from "react";
import { supabase, fetchRoom, type RoomState } from "./live";

/* Follows one room.

   Realtime carries the slide change the instant the presenter clicks, which is
   what makes the room feel live. It is not trusted on its own: conference wifi
   drops websockets, and a viewer stranded on the previous slide has no way to
   tell. So a slow reconciliation poll runs underneath and quietly repairs the
   state — cheap at five seconds, and it means a dropped socket costs a moment
   of staleness rather than the rest of the talk. */
export function useRoom(code: string | null): RoomState | null {
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    if (!code) return;
    let alive = true;

    const pull = () => {
      fetchRoom(code)
        .then((r) => { if (alive && r) setRoom(r); })
        .catch(() => { /* offline for a beat; the next tick tries again */ });
    };

    pull();

    const channel = supabase
      .channel(`nv:${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nv_rooms", filter: `code=eq.${code}` },
        (payload) => { if (alive && payload.new) setRoom(payload.new as RoomState); },
      )
      .subscribe();

    const reconcile = setInterval(pull, 5000);

    return () => {
      alive = false;
      clearInterval(reconcile);
      supabase.removeChannel(channel);
    };
  }, [code]);

  return room;
}

/* Seconds left on the poll, ticking locally.

   The deadline is a server timestamp, so every device counts down to the same
   instant regardless of when it joined or how far its own clock has drifted. */
export function useCountdown(endsAt: string | null): number | null {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) { setLeft(null); return; }
    const target = new Date(endsAt).getTime();
    const tick = () => setLeft(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [endsAt]);

  return left;
}
