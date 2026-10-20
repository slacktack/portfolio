"use client";

import { PrinterIcon } from "@/components/icons";

export function PrintButton() {
  return (
    <button className="btn btn-ghost btn-sm no-print" type="button" onClick={() => window.print()}>
      <PrinterIcon width={13} height={13} />
      Print
    </button>
  );
}
