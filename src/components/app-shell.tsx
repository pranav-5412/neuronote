"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Brain,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sun,
  Moon,
  ArrowUpRight,
  Sprout,
  Settings,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/components/search-command";
import { useWorkspace } from "@/state/workspace-provider";
function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "N"
  );
}
function SidebarContent({
  close,
  collapsed = false,
  toggle,
}: {
  close?: () => void;
  collapsed?: boolean;
  toggle?: () => void;
}) {
  const pathname = usePathname();
  const { profile } = useWorkspace();
  return (
    <>
      <Link href="/" className="brand" onClick={close}>
        <span className="brand-symbol">
          <Brain size={22} />
        </span>
        {!collapsed && (
          <span>
            NeuroNote<span className="brand-dot">.</span>
          </span>
        )}
      </Link>
      {!collapsed && (
        <div className="workspace-label">
          <span className="workspace-avatar">
            {initials(profile.displayName)}
          </span>
          <div>
            Personal workspace<small>Make room for a little more.</small>
          </div>
          <ChevronDown size={13} />
        </div>
      )}
      <div className="nav-label">{collapsed ? "•••" : "WORKSPACE"}</div>
      <nav aria-label="Main navigation">
        {navigation.slice(0, 9).map((item, index) => (
          <Link
            title={collapsed ? item.label : undefined}
            onClick={close}
            href={item.href}
            key={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "nav-item",
              pathname === item.href && "active",
              index === 8 && "tutor-link",
            )}
          >
            <item.icon size={18} />
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.label === "AI Tutor" && (
                  <span className="tiny-tag">SOON</span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="sidebar-note">
            <Sprout size={21} />
            <p>
              A little every day.
              <br />
              <strong>A lot over time.</strong>
            </p>
            <span>Your future self will thank you.</span>
          </div>
        )}
        <Link
          onClick={close}
          href="/settings"
          className={cn("nav-item", pathname === "/settings" && "active")}
          title="Settings"
        >
          <Settings size={18} />
          {!collapsed && "Settings"}
        </Link>
        <div className="profile">
          <span className="avatar">{initials(profile.displayName)}</span>
          {!collapsed && (
            <div>
              <strong>{profile.displayName || "Student"}</strong>
              <small>Student · Personal</small>
            </div>
          )}
          {toggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
export function ThemeToggle() {
  const { setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle color theme"
      onClick={() =>
        setTheme(
          document.documentElement.classList.contains("dark")
            ? "light"
            : "dark",
        )
      }
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { profile } = useWorkspace();
  const current = navigation.find((item) => item.href === pathname);
  return (
    <div className={cn("app-shell", collapsed && "is-collapsed")}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="desktop-sidebar">
        <SidebarContent
          collapsed={collapsed}
          toggle={() => setCollapsed((value) => !value)}
        />
      </aside>
      <DialogPrimitive.Root open={mobile} onOpenChange={setMobile}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <DialogPrimitive.Content
            className="mobile-sidebar"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              mobileTrigger.current?.focus();
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              Navigation
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Navigate your study workspace
            </DialogPrimitive.Description>
            <SidebarContent close={() => setMobile(false)} />
            <DialogPrimitive.Close className="absolute right-3 top-6 text-xs text-muted-foreground">
              Close
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <div className="main-shell">
        <header className="topbar">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu"
            ref={mobileTrigger}
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu />
          </Button>
          <div className="breadcrumb">
            Workspace <span>/</span>
            <strong>{current?.label ?? "Page"}</strong>
          </div>
          <SearchCommand />
          <div className="topbar-right">
            <span className="demo-badge">
              <span /> Private workspace
            </span>
            <ThemeToggle />
            <Link
              href="/settings"
              className="avatar small"
              aria-label="Profile settings"
            >
              {initials(profile.displayName)}
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {children}
          </motion.div>
          <footer className="app-footer">
            <span>A little curiosity goes a long way.</span>
            <span>
              Made for a mind like yours <ArrowUpRight size={12} />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
