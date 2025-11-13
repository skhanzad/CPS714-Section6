import Sidebar from "./components/Sidebar";
import TopBar from "./components/Topbar";
import { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  userName: string;
  activeRoute: "dashboard" | "history" | "redeem";
};

export default function DashboardLayout({
  children,
  userName,
  activeRoute,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar activeRoute={activeRoute} />

      <main className="flex-1 p-8 xl:p-10">
        <TopBar userName={userName} />
        <section className="mt-10">{children}</section>
      </main>
    </div>
  );
}
