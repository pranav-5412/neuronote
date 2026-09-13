"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, ArrowUpRight, Brain } from "lucide-react";
import { navigation } from "@/lib/navigation";
import { brains } from "@/data/mock-data";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  function go(path: string) {
    setOpen(false);
    router.push(path);
  }
  return (
    <>
      <button
        ref={trigger}
        onClick={() => setOpen(true)}
        className="search-trigger"
        aria-label="Search your brain"
      >
        <Search size={17} />
        <span>Search your brain...</span>
        <kbd>⌘ K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 overflow-hidden"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">Search your brain</DialogTitle>
          <DialogDescription className="sr-only">
            Find a workspace or jump to a page.
          </DialogDescription>
          <Command>
            <div className="flex items-center gap-3 border-b border-border px-5 pr-12">
              <Search size={18} />
              <Command.Input
                placeholder="Where would you like to go?"
                className="h-16 w-full bg-transparent outline-none text-sm"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="p-8 text-center text-sm text-muted-foreground">
                No matches. Try a subject or page name.
              </Command.Empty>
              <Command.Group heading="YOUR BRAINS">
                {brains.map((brain) => (
                  <Command.Item
                    key={brain.id}
                    value={brain.name}
                    onSelect={() => go(`/my-brain?brain=${brain.id}`)}
                  >
                    <Brain size={16} />
                    {brain.name}
                    <ArrowUpRight size={14} className="ml-auto" />
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="JUMP TO">
                {navigation.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={item.label + " page"}
                    onSelect={() => go(item.href)}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              ↑ ↓ to navigate <span className="mx-3">↵ to open</span> esc to
              close
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
