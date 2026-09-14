"use client";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Files,
  Network,
  Layers,
  ListChecks,
  Flame,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";
import { Button } from "@/components/ui/button";
import { BrainCard } from "./brain-card";
const statIcons = [Files, Network, Layers, ListChecks];
export function Dashboard() {
  const { brains, state, profile } = useWorkspace();
  const values = [
    state.documents.length,
    state.concepts.length,
    state.documents.reduce((sum, doc) => sum + doc.flashcards, 0),
    state.documents.reduce((sum, doc) => sum + doc.quizzes, 0),
  ];
  const stats = ["Documents", "Concepts", "Flashcards", "Quizzes"].map(
    (label, index) => ({
      label,
      value: values[index],
      detail:
        index === 0 ? "Private source material" : "Study tools arrive later",
    }),
  );
  const recent = state.documents[0];
  const activities = state.documents.slice(0, 4).map((doc) => ({
    id: doc.id,
    kind: "document",
    title: doc.name,
    description: "Added to your library",
    brain: brains.find((brain) => brain.id === doc.brainId)?.name,
    time: new Date(doc.uploadedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }),
  }));
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR SPACE TO CONNECT THE DOTS</div>
          <h1>
            Welcome back, {profile.displayName || "curious mind"}{" "}
            <span className="wave">✳</span>
          </h1>
          <p>A home for everything you’re learning.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/my-brain?new=true">
            <Plus />
            New brain
          </Link>
        </Button>
      </div>
      <section className="overview" aria-labelledby="overview-title">
        <div className="section-title">
          <h2 id="overview-title">Your brain, at a glance</h2>
          <span className="subtle-label">Small steps. Lasting knowledge.</span>
        </div>
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = statIcons[index];
            return (
              <div className="stat" key={stat.label}>
                <div className="stat-label">
                  <Icon size={16} />
                  {stat.label}
                </div>
                <strong>{stat.value}</strong>
                <span>{stat.detail}</span>
              </div>
            );
          })}
          <div className="stat mastery-stat">
            <div className="stat-label">
              <Sparkles size={16} />
              Overall mastery
            </div>
            <div className="mastery-value">
              <strong>—</strong>
              <span className="growth">Tracking arrives later</span>
            </div>
            <div className="progress-track">
              <div style={{ width: "0%" }} />
            </div>
          </div>
        </div>
      </section>
      <div className="study-row">
        <section className="continue-section" aria-labelledby="continue-title">
          <div className="section-title">
            <h2 id="continue-title">Pick up where you left off</h2>
          </div>
          <div className="continue-card">
            <div className="continue-copy">
              <span className="subject-label">YOUR STUDY MATERIAL</span>
              <h3>{recent?.name || "Make room for your next idea."}</h3>
              <p>
                {recent
                  ? "Open your latest source material and keep exploring."
                  : "Create a brain, then add your first document."}
              </p>
              <Button asChild>
                <Link
                  href={
                    recent
                      ? `/documents?document=${recent.id}`
                      : "/my-brain?new=true"
                  }
                >
                  {recent ? "Open document" : "Create your first brain"}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="concept-art" aria-hidden="true">
              <svg viewBox="0 0 260 210">
                <g stroke="currentColor" strokeWidth="1" fill="none">
                  <path d="M130 103L49 47M130 103L212 42M130 103L226 151M130 103L116 181M130 103L35 147M49 47L35 147M212 42L226 151M116 181L226 151M49 47L212 42" />
                  <circle
                    cx="130"
                    cy="103"
                    r="60"
                    strokeDasharray="3 5"
                    opacity=".4"
                  />
                </g>
                <g fill="var(--card)" stroke="currentColor">
                  <circle cx="49" cy="47" r="15" />
                  <circle cx="212" cy="42" r="11" />
                  <circle cx="226" cy="151" r="20" />
                  <circle cx="116" cy="181" r="10" />
                  <circle cx="35" cy="147" r="9" />
                </g>
                <circle cx="130" cy="103" r="34" fill="var(--primary)" />
                <g stroke="white" fill="none" strokeWidth="1.5">
                  <ellipse
                    cx="130"
                    cy="103"
                    rx="19"
                    ry="11"
                    transform="rotate(-35 130 103)"
                  />
                  <ellipse
                    cx="130"
                    cy="103"
                    rx="12"
                    ry="20"
                    transform="rotate(-35 130 103)"
                  />
                  <circle cx="130" cy="103" r="4" />
                </g>
                <g fill="currentColor">
                  <circle cx="49" cy="47" r="4" />
                  <circle cx="226" cy="151" r="6" />
                </g>
              </svg>
              <span>Every connection counts.</span>
            </div>
          </div>
        </section>
        <section className="streak-card" aria-labelledby="streak-title">
          <div className="streak-top">
            <span className="flame-icon">
              <Flame size={20} />
            </span>
            <span>KEEP SHOWING UP</span>
          </div>
          <h2 id="streak-title">
            — day streak<span>A fresh beginning.</span>
          </h2>
          <p>
            You’re building more than knowledge.
            <br />
            You’re building a habit.
          </p>
          <p>Streak tracking arrives with study sessions.</p>
          <small>A little today. A stronger tomorrow.</small>
        </section>
      </div>
      <section className="brains-section" aria-labelledby="brains-title">
        <div className="section-title">
          <div className="flex items-center gap-2">
            <h2 id="brains-title">Your brains</h2>
            <span className="count-pill">{brains.length}</span>
          </div>
          <Link className="text-link" href="/my-brain">
            View all brains
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="brains-grid">
          {!brains.length && (
            <p className="muted">
              Your brains will appear here. Start with a subject you love.
            </p>
          )}
          {brains.map((brain) => (
            <BrainCard key={brain.id} brain={brain} />
          ))}
        </div>
      </section>
      <section className="activity-section" aria-labelledby="activity-title">
        <div className="section-title">
          <h2 id="activity-title">Recently in your world</h2>
          <span className="subtle-label">Your learning, in motion</span>
        </div>
        <div className="activity-list">
          {!activities.length && (
            <p className="muted">
              Add a document to start your learning story.
            </p>
          )}
          {activities.map((activity) => {
            const Icon =
              activity.kind === "flashcards"
                ? Layers
                : activity.kind === "quiz"
                  ? ListChecks
                  : Files;
            return (
              <Link
                href={`/documents?document=${activity.id}`}
                key={activity.id}
                className="activity-item"
              >
                <span className="activity-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>
                </div>
                <span className="activity-brain">{activity.brain}</span>
                <time>{activity.time}</time>
                <ArrowUpRight size={15} className="activity-arrow" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
