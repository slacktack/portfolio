"use client";

import type { ThemeAppProps } from "../types";

export default function App({ route }: ThemeAppProps) {
  return <div className="t-onyx">onyx · {route.view}</div>;
}
