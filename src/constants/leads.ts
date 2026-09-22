// Shared lead rules — used by the Mongoose model, API routes and UI.

// Order matters: this is the order the board and the filter tabs use. A new lead starts at
// "pending" — nothing has been emailed yet — and moves to "sent" when the first email goes out.
export const LEAD_STATUSES = ["pending", "sent", "followup_due", "replied", "converted", "rejected", "dead"] as const;
export type LeadStatusDB = (typeof LEAD_STATUSES)[number];

export const LEAD_PLATFORMS = ["upwork", "fiverr", "linkedin", "direct", "referral", "whatsapp", "cold_email", "other"] as const;

// A lead gets at most this many follow-ups. The last one moves it to "dead".
export const MAX_FOLLOW_UPS = 2;

// A waiting lead is due for its next follow-up this many days after the last touch (sent or follow-up).
export const FOLLOW_UP_AFTER_DAYS = 3;

// Follow-ups can only be logged while the lead is still waiting for a reply.
// "pending" is not here: it means nothing has been emailed yet, so there is nothing to follow up,
// and counting it made a brand new lead look due for a follow-up three days after it was created.
export const FOLLOW_UP_STATUSES: LeadStatusDB[] = ["sent", "followup_due"];

// Closed leads — no more follow-ups, reminders get closed.
export const CLOSED_STATUSES: LeadStatusDB[] = ["converted", "rejected", "dead"];
