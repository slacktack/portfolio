"use client";

import { useEffect, useState } from "react";

export function Pulse() {
  const [p, setP] = useState(19.8);
  const [req, setReq] = useState(478291);

  useEffect(() => {
    const t = window.setInterval(() => {
      setP((v) => Math.max(17.5, Math.min(22, v + (Math.random() - 0.5) * 1.2)));
      setReq((v) => v + Math.floor(Math.random() * 9));
    }, 1800);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="pulse" role="status">
      <i />
      <span>
        p99 <b>{p.toFixed(1)}ms</b>
      </span>
      <span>
        <b>{req.toLocaleString("en-IN")}</b> req today
      </span>
      <em>illustrative</em>
    </div>
  );
}
