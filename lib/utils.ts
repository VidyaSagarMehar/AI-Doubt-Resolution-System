export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getStatusTone(status: string) {
  switch (status) {
    case "resolved":
      return "bg-brand-success/10 text-brand-success border border-brand-success/25";
    case "mentor_replied":
      return "bg-brand-link/10 text-brand-link border border-brand-link/25";
    case "escalated":
      return "bg-brand-accent/10 text-brand-accent border border-brand-accent/25";
    default:
      return "bg-brand-border/50 text-brand-neutral/70 border border-brand-border";
  }
}
