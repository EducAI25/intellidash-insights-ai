import { ReactNode } from "react";
import { TopHeader } from "./TopHeader";

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}