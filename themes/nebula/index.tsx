"use client";

import type { ThemeAppProps } from "../types";

export default function App({ route }: ThemeAppProps) {
  return <div className="t-nebula">nebula · {route.view}</div>;
}
