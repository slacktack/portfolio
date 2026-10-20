"use client";

import { useState } from "react";
import { ArrowUpRight } from "@/components/icons";

const initial = { name: "", email: "", message: "" };

export function ContactForm({ email }: { email: string }) {
  const [fields, setFields] = useState(initial);
  const [status, setStatus] = useState("AWAITING REQUEST");
  const [sent, setSent] = useState(false);

  const update = (key: keyof typeof initial) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Hello from ${fields.name || "the internet"}`);
    const body = encodeURIComponent(
      `${fields.message}\n\n— ${fields.name || "Anonymous"}\n${fields.email}`
    );
    setStatus("302 → HANDING OFF TO MAIL CLIENT");
    setSent(true);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="http-form" onSubmit={submit}>
      <div className="http-head mono">
        <span>
          <span className="method">POST</span> /contact
        </span>
        <span>HTTP/2 · TLS 1.3</span>
      </div>

      <div className="http-body">
        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            value={fields.name}
            onChange={update("name")}
            placeholder="Ada Lovelace"
            autoComplete="name"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="contact-email">Reply-to</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={fields.email}
            onChange={update("email")}
            placeholder="ada@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="contact-message">Body</label>
          <textarea
            id="contact-message"
            name="message"
            value={fields.message}
            onChange={update("message")}
            placeholder="What are you building, and where does it hurt?"
            rows={3}
            required
          />
        </div>

        <div className="http-foot">
          <span className={`http-status mono ${sent ? "ok" : ""}`} aria-live="polite">
            {status}
          </span>
          <button className="btn btn-sm" type="submit">
            Send request
            <ArrowUpRight width={13} height={13} />
          </button>
        </div>
      </div>
    </form>
  );
}
