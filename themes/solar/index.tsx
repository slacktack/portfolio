"use client";

import type { ThemeAppProps } from "../types";

export default function App({ route }: ThemeAppProps) {
  return <div className="t-solar">solar · {route.view}</div>;
}
