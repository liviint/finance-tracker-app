import "./about.css";

export const metadata = {
  title: "About Us | ZeniaHub",
  description:
    "Learn more about ZeniaHub — a wellness and productivity platform built to inspire personal growth, reflection, and daily progress.",
};

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <h1>About ZeniaHub 🌿</h1>
        <p>
          At <strong>ZeniaHub</strong>, we believe that personal growth and productivity start
          with self-reflection, good habits, and meaningful daily practices. Our platform
          helps you track your habits, reflect on your journey, and improve your well-being.
        </p>
      </section>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          We’re creating a supportive digital space that encourages learning, personal growth,
          and productivity. Through our journaling tools, habit tracker, and curated content,
          we aim to help you reflect, learn, and thrive every day.
        </p>
      </section>

      <section className="about-values">
        <h2>Our Values</h2>
        <ul>
          <li>
            <strong>Growth:</strong> We believe in continuous improvement and self-development.
          </li>
          <li>
            <strong>Consistency:</strong> Small daily actions build meaningful change.
          </li>
          <li>
            <strong>Authenticity:</strong> We encourage honest reflection and real experiences.
          </li>
        </ul>
      </section>

      <section className="about-how">
        <h2>How ZeniaHub Works</h2>
        <p>
          ZeniaHub helps you grow and stay productive through a simple, human-centered journey:
        </p>
        <ul>
          <li>
            <strong>Reflect —</strong> Use journaling to capture your thoughts, track progress,
            and gain clarity on your daily experiences.
          </li>
          <li>
            <strong>Track —</strong> Build and maintain habits that support your goals, whether
            it’s wellness, learning, or productivity.
          </li>
          <li>
            <strong>Grow —</strong> Review your progress, celebrate wins, and adjust your
            routines to continuously improve.
          </li>
        </ul>
        <p>
          Every feature on ZeniaHub is built around one belief: personal growth happens when
          we reflect, track, and act consistently.
        </p>
      </section>

      <section className="about-cta">
        <p>
          Start your journey toward focus, growth, and daily progress today.
        </p>
      </section>
    </main>
  );
}
