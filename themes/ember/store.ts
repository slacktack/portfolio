"use client";

import { useSyncExternalStore } from "react";

type BoardApi = { zoomBy: (f: number) => void; reset: () => void; focus: (id: string) => void };

let api: BoardApi | null = null;
let zoom = 1;
const subs = new Set<() => void>();

export const boardStore = {
  attach(a: BoardApi | null) {
    api = a;
    if (!a) boardStore.setZoom(1);
  },
  setZoom(z: number) {
    if (Math.abs(z - zoom) < 0.001) return;
    zoom = z;
    subs.forEach((f) => f());
  },
  zoomBy: (f: number) => api?.zoomBy(f),
  reset: () => api?.reset(),
  focus: (id: string) => api?.focus(id),
  live: () => api !== null,
};

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};

export function useZoom() {
  return useSyncExternalStore(
    subscribe,
    () => zoom,
    () => 1
  );
}
