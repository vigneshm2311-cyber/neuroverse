/* Routing is kept clear of live.ts on purpose: main.tsx needs readRoute on every
   load, and importing it from the module that creates the Supabase client would
   pull the whole client into the solo bundle and undo the lazy split. Three
   routes do not justify a router dependency either. */

export type Route =
  | { kind: "solo" }
  | { kind: "present" }
  | { kind: "viewer"; code: string };

export function readRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (path === "/present") return { kind: "present" };
  const live = path.match(/^\/live\/([A-Za-z0-9]{5})$/);
  if (live) return { kind: "viewer", code: live[1].toUpperCase() };
  return { kind: "solo" };
}

export function viewerUrl(code: string): string {
  return `${window.location.origin}/live/${code}`;
}
