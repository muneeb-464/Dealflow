// Shared lead rules — used by the Mongoose model, API routes and UI.

export const LEAD_STATUSES = ["sent", "pending", "followup_due", "replied", "converted", "rejected", "dead"] as const;
export type LeadStatusDB = (typeof LEAD_STATUSES)[number];

export const LEAD_PLATFORMS = ["upwork", "fiverr", "linkedin", "direct", "referral", "whatsapp", "cold_email", "other"] as const;

// A lead gets at most this many follow-ups. The last one moves it to "dead".
export const MAX_FOLLOW_UPS = 3;

// A waiting lead is due for its next follow-up this many days after the last touch (sent or follow-up).
export const FOLLOW_UP_AFTER_DAYS = 3;

// Follow-ups can only be logged while the lead is still waiting for a reply.
export const FOLLOW_UP_STATUSES: LeadStatusDB[] = ["sent", "pending", "followup_due"];

// Closed leads — no more follow-ups, reminders get closed.
export const CLOSED_STATUSES: LeadStatusDB[] = ["converted", "rejected", "dead"];
