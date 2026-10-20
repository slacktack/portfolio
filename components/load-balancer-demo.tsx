"use client";

import { useEffect, useRef, useState } from "react";

type Server = {
  id: string;
  name: string;
  weight: number;
  healthy: boolean;
  requests: number;
};

type Packet = {
  id: number;
  lane: number;
};

const initialServers: Server[] = [
  { id: "s1", name: "node-01", weight: 50, healthy: true, requests: 0 },
  { id: "s2", name: "node-02", weight: 30, healthy: true, requests: 0 },
  { id: "s3", name: "node-03", weight: 20, healthy: true, requests: 0 },
];

export function LoadBalancerDemo() {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [routed, setRouted] = useState(0);
  const [sticky, setSticky] = useState(false);
  const stickyLane = useRef<number | null>(null);
  const packetId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const healthyCount = servers.filter((server) => server.healthy && server.weight > 0).length;
  const totalWeight = servers
    .filter((server) => server.healthy)
    .reduce((sum, server) => sum + server.weight, 0);

  const pickLane = () => {
    const candidates = servers
      .map((server, index) => ({ server, index }))
      .filter(({ server }) => server.healthy && server.weight > 0);
    if (!candidates.length) return -1;

    if (sticky && stickyLane.current !== null && candidates.some(({ index }) => index === stickyLane.current)) {
      return stickyLane.current;
    }

    const total = candidates.reduce((sum, { server }) => sum + server.weight, 0);
    let ticket = Math.random() * total;
    for (const { server, index } of candidates) {
      ticket -= server.weight;
      if (ticket <= 0) {
        if (sticky) stickyLane.current = index;
        return index;
      }
    }

    const fallback = candidates[candidates.length - 1].index;
    if (sticky) stickyLane.current = fallback;
    return fallback;
  };

  const dispatch = () => {
    const lane = pickLane();
    if (lane === -1) return;

    const id = (packetId.current += 1);
    setPackets((current) => [...current, { id, lane }]);
    setServers((current) =>
      current.map((server, index) =>
        index === lane ? { ...server, requests: server.requests + 1 } : server
      )
    );
    setRouted((value) => value + 1);

    const timer = window.setTimeout(() => {
      setPackets((current) => current.filter((packet) => packet.id !== id));
    }, 680);
    timers.current.push(timer);
  };

  const burst = () => {
    for (let index = 0; index < 10; index += 1) {
      const timer = window.setTimeout(dispatch, index * 60);
      timers.current.push(timer);
    }
  };

  const toggleServer = (index: number) => {
    setServers((current) =>
      current.map((server, serverIndex) =>
        serverIndex === index ? { ...server, healthy: !server.healthy } : server
      )
    );
    if (stickyLane.current === index) stickyLane.current = null;
  };

  const setWeight = (index: number, weight: number) => {
    setServers((current) =>
      current.map((server, serverIndex) =>
        serverIndex === index ? { ...server, weight } : server
      )
    );
  };

  const reset = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    setServers(initialServers);
    setPackets([]);
    setRouted(0);
    setSticky(false);
    stickyLane.current = null;
  };

  return (
    <div className="lab-demo">
      <div className="demo-head">
        <div className="demo-title">
          <strong>Weighted load balancer</strong>
          <span>Interactive simulation · client-side</span>
        </div>
        <div className="demo-controls">
          <button className="demo-btn" type="button" onClick={() => setSticky((value) => {
            stickyLane.current = null;
            return !value;
          })} data-on={sticky}>
            Sticky {sticky ? "on" : "off"}
          </button>
          <button className="demo-btn" type="button" onClick={burst}>
            Burst ×10
          </button>
          <button className="demo-btn" type="button" onClick={reset}>
            Reset
          </button>
          <button className="demo-btn" type="button" onClick={dispatch} data-on="true">
            Send request
          </button>
        </div>
      </div>

      <div className="lb-stage">
        <div className="lb-source">
          <div className="lb-box">
            <strong>Client</strong>
            <span>keep-alive</span>
          </div>
          <div className="lb-connector" />
          <div className="lb-box lb-core">
            <strong>LB core</strong>
            <span>{sticky ? "sticky session" : "weighted round robin"}</span>
          </div>
          <div className="lb-connector" />
          <div className="lb-box">
            <strong>Health check</strong>
            <span>every 5s · 3 fails</span>
          </div>
        </div>

        <div className="lb-lanes">
          {servers.map((server, index) => (
            <div className="lb-lane" key={server.id}>
              <div className="lb-track" data-off={!server.healthy || server.weight === 0}>
                <span className="lb-lane-label">lane {index + 1}</span>
                {packets
                  .filter((packet) => packet.lane === index)
                  .map((packet) => (
                    <span className="lb-packet" key={packet.id} />
                  ))}
              </div>

              <div className="server-card" data-healthy={server.healthy && server.weight > 0}>
                <div className="server-head">
                  <span className="server-name">
                    <span className="dot" />
                    {server.name}
                  </span>
                  <button className="kill-btn" type="button" onClick={() => toggleServer(index)}>
                    {server.healthy ? "Kill" : "Revive"}
                  </button>
                </div>

                <div className="server-stats">
                  <span>
                    req <b>{server.requests}</b>
                  </span>
                  <span>
                    share <b>{routed ? Math.round((server.requests / routed) * 100) : 0}%</b>
                  </span>
                  <span className="server-status">
                    {server.healthy ? (server.weight === 0 ? "drained" : "healthy") : "offline"}
                  </span>
                </div>

                <label className="weight">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={server.weight}
                    onChange={(event) => setWeight(index, Number(event.target.value))}
                    aria-label={`Traffic weight for ${server.name}`}
                  />
                  <span>{server.weight}w</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-metrics">
        <div className="demo-metric">
          <b>{routed}</b>
          <span>Requests routed</span>
        </div>
        <div className="demo-metric">
          <b>{healthyCount} / 3</b>
          <span>Healthy nodes</span>
        </div>
        <div className="demo-metric">
          <b>{totalWeight}</b>
          <span>Combined weight</span>
        </div>
        <div className="demo-metric">
          <b>{sticky ? "ON" : "OFF"}</b>
          <span>Sticky sessions</span>
        </div>
      </div>

      <div className="demo-note">
        <span className="dot" />
        {healthyCount === 0
          ? "Circuit open — every node is offline. Revive a node to route traffic."
          : `Routing across ${healthyCount} healthy node${healthyCount === 1 ? "" : "s"}. Kill one and the next request fails over.`}
      </div>
    </div>
  );
}
