"use client";
import type { Lead } from "./LeadTable";
import { MAX_FOLLOW_UPS } from "@/constants/leads";

// UI statuses where a follow-up can still be sent (mirrors FOLLOW_UP_STATUSES in constants/leads.ts)
const CAN_FOLLOW_UP: Lead["status"][] = ["Sent", "Follow-up"];

export function canFollowUp(lead: Lead) {
  return CAN_FOLLOW_UP.includes(lead.status) && lead.followUpCount < MAX_FOLLOW_UPS;
}

/** "Follow-ups 1/3" dots + a button that logs one sent follow-up. */
export default function FollowUpControl({ lead, onFollowUp, canAct = true, compact = false }: {
  lead: Lead;
  onFollowUp: (lead: Lead) => void;
  canAct?: boolean;
  compact?: boolean;
}) {
  const count = Math.min(lead.followUpCount, MAX_FOLLOW_UPS);
  const isLast = count === MAX_FOLLOW_UPS - 1;
  const showButton = canAct && canFollowUp(lead);

  return (
    <div className={compact ? "flex items-center gap-2" : "flex items-center justify-between gap-2"}>
      <div className="flex items-center gap-1.5" title={`${count} of ${MAX_FOLLOW_UPS} follow-ups sent`}>
        <span className="text-[10px] font-semibold text-neutral whitespace-nowrap">Follow-ups</span>
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_FOLLOW_UPS }).map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < count ? "bg-tertiary" : "bg-neutral/20"}`} />
          ))}
        </div>
        <span className="text-[10px] font-bold text-primary">{count}/{MAX_FOLLOW_UPS}</span>
      </div>

      {showButton && (
        <button
          onClick={(e) => { e.stopPropagation(); onFollowUp(lead); }}
          title={isLast ? "Last follow-up — the lead moves to Dead" : "Log a sent follow-up"}
          className={`text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
            isLast
              ? "bg-tertiary/10 text-tertiary hover:bg-tertiary/20"
              : "bg-neutral-light text-primary hover:bg-secondary/15"
          }`}
        >
          {isLast ? "+ Last follow-up" : "+ Follow-up"}
        </button>
      )}
    </div>
  );
}
