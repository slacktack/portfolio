import Image from "next/image";
import { profile } from "@/lib/site";

export function OperatorCard() {
  return (
    <div className="operator">
      <div className="operator-top">
        <span>Operator card</span>
        <b>TG—001</b>
      </div>
      <div className="operator-body">
        <div className="operator-monogram" aria-hidden="true">
          T<span>G</span>
        </div>

        <div className="operator-photo">
          <Image
            src="/assets/rain-window.jpg"
            alt="Tushar reflected in a rain-covered window, throwing a peace sign"
            fill
            sizes="(max-width: 900px) 90vw, 360px"
          />
        </div>

        <div className="operator-rows">
          <div className="operator-row">
            <span>Base</span>
            <b>Bangalore, IN</b>
          </div>
          <div className="operator-row">
            <span>Role</span>
            <b>Backend · SDE-1</b>
          </div>
          <div className="operator-row">
            <span>Focus</span>
            <b>Comparison systems</b>
          </div>
          <div className="operator-row">
            <span>Status</span>
            <b>{profile.availability}</b>
          </div>
        </div>

        <div className="barcode" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <i key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
