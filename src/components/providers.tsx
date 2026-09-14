"use client";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "@/state/workspace-provider";
import { MotionConfig } from "motion/react";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
