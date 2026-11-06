"use client";

import type { ReactNode } from "react";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";

export type BenchEntry = { slug: string; label: string; title: string; note: string; demo?: ReactNode; from?: { slug: string; title: string } };

// Copy mirrors the lab page so every theme tells the same story.
export const bench: BenchEntry[] = [
  { slug: "cache-key", label: "Flights · cache design", title: "Change one thing. Watch the cache decide.", note: "A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building.", demo: <CacheKeyLab />, from: { slug: "flights", title: "Flight comparison" } },
  { slug: "deadlines", label: "Hotels · stragglers", title: "Average latency is a liar.", note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.", demo: <DeadlineLab />, from: { slug: "hotels", title: "Hotel comparison" } },
  { slug: "identity", label: "Hotels · identity", title: "Same name is not the same hotel.", note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.", demo: <IdentityLab />, from: { slug: "hotels", title: "Hotel comparison" } },
  { slug: "logs", label: "Observability · alerting", title: "Silence is a signal.", note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.", demo: <LogStreamLab />, from: { slug: "observability", title: "OpenObserve platform" } },
  { slug: "memcached", label: "Systems · from scratch", title: "Memcached, rebuilt.", note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire.", demo: <MemcachedLab /> },
  { slug: "load-balancer", label: "Build · Go load balancer", title: "Weighted routing you can break.", note: "A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo runs the routing logic in your browser so you can kill a node and watch the next request fail over.", demo: <LoadBalancerDemo /> },
  { slug: "vortex-vault", label: "Build · VortexVault", title: "One vector database. Two runtimes.", note: "A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the same benchmark. The interesting part is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state. Still in progress." },
];

export const vortexParts = [
  ["Client", "insert / query / delete"],
  ["WAL", "durable append + replay"],
  ["Memtable", "mutable in-memory index"],
  ["Segment", "immutable on-disk index"],
  ["Compaction", "merge + tombstone cleanup"],
];

export const benchFor = (slug: string) => bench.find((b) => b.slug === slug);
