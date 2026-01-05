import React from "react";
import Link from "next/link";
import "./home.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Welcome to ZeniaHub</h1>
        <p className="home-subtitle">
          Your personal space to reflect, grow, and thrive.
        </p>
        <div className="home-cta">
          <div>
            <Link href="/journal" className="home-button primary">
            Start Journaling
          </Link>
          </div>
          <div>
            <Link href="/habits" className="home-button secondary">
            Track Habits
          </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="home-features">
        <div className="feature-card">
          <h3>📝 Journal</h3>
          <p>Capture your thoughts and track your personal growth.</p>
          <Link href="/journal" className="home-button small">
            Go to Journal
          </Link>
        </div>

        <div className="feature-card">
          <h3>✅ Habits</h3>
          <p>Build and maintain habits that improve your daily life.</p>
          <Link href="/habits" className="home-button small">
            View Habits
          </Link>
        </div>
      </section>

      <section className="home-about">
        <p>
          <strong>ZeniaHub</strong> helps you reflect on your thoughts, track habits, and improve your daily life with simple journaling and habit tracking tools.
        </p>
      </section>
    </div>
  );
}
