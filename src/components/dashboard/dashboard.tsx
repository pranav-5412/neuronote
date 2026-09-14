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
  Check,
  Clock3,
  Leaf,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  stats as statLabels,
  activities,
  studySession,
} from "@/data/mock-data";
import { useWorkspace } from "@/state/workspace-provider";
import { Button } from "@/components/ui/button";
import { BrainCard } from "./brain-card";
const statIcons = [Files, Network, Layers, ListChecks];
export function Dashboard() {
  const { brains, state } = useWorkspace();
  const values = [
    state.documents.length,
    state.concepts.length,
    state.documents.reduce((sum, doc) => sum + doc.flashcards, 0),
    state.documents.reduce((sum, doc) => sum + doc.quizzes, 0),
  ];
  const stats = statLabels.map((stat, index) => ({
    ...stat,
    value: String(values[index]),
  }));
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR SPACE TO CONNECT THE DOTS</div>
          <h1>
            Good evening, Pranav <span className="wave">✳</span>
          </h1>
          <p>A little more connected than yesterday. Let’s keep it going.</p>
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
              <strong>
                73<span>%</span>
              </strong>
              <span className="growth">+8% this week</span>
            </div>
            <div className="progress-track">
              <div style={{ width: "73%" }} />
            </div>
          </div>
        </div>
      </section>
      <div className="study-row">
        <section className="continue-section" aria-labelledby="continue-title">
          <div className="section-title">
            <h2 id="continue-title">Pick up where you left off</h2>
            <span className="subtle-label">
              <Clock3 size={13} /> {studySession.minutes} min to a little more
              clarity
            </span>
          </div>
          <div className="continue-card">
            <div className="continue-copy">
              <span className="subject-label">
                <Leaf size={14} />
                BIOLOGY <span> / </span> CHAPTER 06
              </span>
              <h3>{studySession.title}</h3>
              <p>{studySession.subtitle}</p>
              <div className="session-progress">
                <div className="progress-track">
                  <div style={{ width: "75%" }} />
                </div>
                <span>
                  {studySession.reviewed} of {studySession.total} flashcards
                  reviewed
                </span>
              </div>
              <Button asChild>
                <Link href="/flashcards?topic=tissues">
                  Continue studying
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
            7 day streak<span>Looking good.</span>
          </h2>
          <p>
            You’re building more than knowledge.
            <br />
            You’re building a habit.
          </p>
          <div className="streak-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={index}>
                <span>{day}</span>
                <span className={index === 6 ? "today" : ""}>
                  {index === 6 ? <Flame size={13} /> : <Check size={13} />}
                </span>
              </div>
            ))}
          </div>
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
          {activities.map((activity) => {
            const Icon =
              activity.kind === "flashcards"
                ? Layers
                : activity.kind === "quiz"
                  ? ListChecks
                  : Files;
            return (
              <Link
                href={`/${activity.kind === "document" ? "documents" : activity.kind === "quiz" ? "quizzes" : "flashcards"}`}
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
