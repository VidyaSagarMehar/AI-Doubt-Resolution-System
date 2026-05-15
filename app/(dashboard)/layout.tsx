import { DashboardHeader } from "@/components/DashboardHeader";
import { ChatLauncher } from "@/components/ChatLauncher";
import { ChatWidgetProvider } from "@/components/providers/ChatWidgetProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatWidgetProvider>
      <div className="min-h-screen">
        <DashboardHeader />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
      <ChatLauncher />
    </ChatWidgetProvider>
  );
}
