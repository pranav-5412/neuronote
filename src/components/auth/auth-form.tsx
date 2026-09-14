"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Brain, LoaderCircle, Sprout } from "lucide-react";
import { signIn, signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
export function AuthForm({
  mode,
  configured,
  next,
  error,
}: {
  mode: "login" | "signup";
  configured: boolean;
  next: string;
  error?: string;
}) {
  const signup = mode === "signup";
  const [state, action, pending] = useActionState(signup ? signUp : signIn, {});
  return (
    <main className="auth-page">
      <div className="auth-story">
        <Link className="brand" href="/login">
          <Brain size={25} />
          NeuroNote.
        </Link>
        <div>
          <span className="eyebrow">A LITTLE CURIOSITY. A CONNECTED MIND.</span>
          <h1>
            Make room
            <br />
            for what’s next.
          </h1>
          <p>
            Your notes, your subjects, your discoveries.
            <br />
            One quiet place to bring them together.
          </p>
          <div className="auth-connection" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <Sprout size={43} />
          </div>
        </div>
        <small>A little every day. A lot over time.</small>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form-inner">
          <span className="eyebrow">YOUR PERSONAL SECOND BRAIN</span>
          <h2>
            {signup ? "A new chapter starts here." : "Good to have you back."}
          </h2>
          <p>
            {signup
              ? "Create your space for a little more understanding."
              : "Your thoughts and discoveries are waiting for you."}
          </p>
          {!configured && (
            <div className="auth-notice" role="status">
              <strong>Workspace connection needed</strong>
              <p>
                Supabase hasn’t been connected yet. Follow the project’s setup
                guide to activate secure accounts and storage.
              </p>
            </div>
          )}
          <form action={action} className="form-stack">
            <input type="hidden" name="next" value={next} />
            {signup && (
              <label>
                Your name
                <input
                  name="displayName"
                  autoComplete="name"
                  maxLength={80}
                  required
                  placeholder="What should we call you?"
                  disabled={pending}
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                disabled={pending}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={128}
                placeholder={signup ? "At least 8 characters" : "Your password"}
                disabled={pending}
              />
            </label>
            {(state.error || error) && (
              <p className="form-error" role="alert">
                {state.error || error}
              </p>
            )}
            {state.message && (
              <p className="auth-success" role="status">
                {state.message}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={pending || !configured}
            >
              {pending ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  One moment…
                </>
              ) : (
                <>
                  {signup ? "Create your account" : "Sign in"}
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>
          <p className="auth-switch">
            {signup ? "Already have a space?" : "New to NeuroNote?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <div className="auth-privacy">
            Your study files are private to your account.
          </div>
        </div>
      </div>
    </main>
  );
}
