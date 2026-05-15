export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getStatusTone(status: string) {
  switch (status) {
    case "resolved":
      return "bg-sea/10 text-sea";
    case "mentor_replied":
      return "bg-sky-100 text-sky-700";
    case "escalated":
      return "bg-sun/10 text-sun";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
