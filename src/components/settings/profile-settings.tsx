"use client";
import { useState } from "react";
import { useWorkspace } from "@/state/workspace-provider";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
export function ProfileSettings() {
  const { profile, dispatch, busy } = useWorkspace();
  const [name, setName] = useState(profile.displayName);
  const [message, setMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (await dispatch({ type: "profile/update", displayName: name }))
      setMessage("Your profile is updated.");
  }
  return (
    <div className="settings-card mb-6">
      <h2>Your profile</h2>
      <p>A familiar name for your personal workspace.</p>
      <form onSubmit={save} className="form-stack">
        <label>
          Display name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={80}
            disabled={busy}
          />
        </label>
        <div>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
        {message && <p role="status">{message}</p>}
      </form>
      <div className="account-row">
        <div>
          <strong>Signed in as</strong>
          <p>{profile.email}</p>
        </div>
        <Button
          variant="outline"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            try {
              const result = await signOut();
              if (result) setMessage(result.error);
            } finally {
              setSigningOut(false);
            }
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
