import { redirect } from "next/navigation";
import { getWorkspace } from "@/lib/repositories/workspace";
import { PublicError } from "@/lib/result";
import { supabaseConfigured } from "@/lib/supabase/config";
import { WorkspaceProvider } from "@/state/workspace-provider";
import { AppShell } from "@/components/app-shell";
import { WorkspaceLoadError } from "@/components/auth/workspace-load-error";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigured()) redirect("/login");
  let snapshot;
  try {
    snapshot = await getWorkspace();
  } catch (error) {
    if (error instanceof PublicError && error.status === 401)
      redirect("/login");
    return <WorkspaceLoadError />;
  }
  return (
    <WorkspaceProvider key={snapshot.profile.id} initialData={snapshot}>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
