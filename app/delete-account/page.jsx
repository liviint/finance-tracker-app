import React from "react";

const DeleteAccount = () => {
  return (
    <div
      style={{
        backgroundColor: "#FAF9F7",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif",
        color: "#333333",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "28px",
            color: "#2E8B8B",
            marginBottom: "10px",
          }}
        >
          Delete Your ZeniaHub Account
        </h1>

        <p style={{ marginBottom: "20px" }}>
          At <strong>ZeniaHub</strong>, we respect your privacy. You may request
          permanent deletion of your account and associated data at any time.
        </p>

        <div
          style={{
            backgroundColor: "#F4E1D2",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #FF6B6B",
          }}
        >
          <strong>⚠ Important:</strong> This action is permanent and cannot be undone.
        </div>

        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "22px",
            marginBottom: "10px",
            color: "#2E8B8B",
          }}
        >
          Data that will be deleted
        </h2>

        <ul style={{ lineHeight: "1.8", marginBottom: "20px" }}>
          <li>Your account profile and username</li>
          <li>Posts, comments, replies, and reactions</li>
          <li>Chat messages and connections</li>
          <li>Personal preferences and app activity</li>
        </ul>

        <p style={{ marginBottom: "20px" }}>
          Some anonymized data that cannot be linked back to your identity may be
          retained for safety, analytics, or legal compliance.
        </p>

        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "22px",
            marginBottom: "10px",
            color: "#2E8B8B",
          }}
        >
          How to request account deletion
        </h2>

        <p style={{ marginBottom: "8px" }}>
          Send an email to:{" "}
          <a
            href="mailto:livitagency1@gmail.com"
            style={{ color: "#FF6B6B", fontWeight: 600 }}
          >
            livitagency1@gmail.com
          </a>
        </p>

        <p>Use the subject line:</p>

        <div
          style={{
            background: "#FAF9F7",
            padding: "10px 15px",
            borderRadius: "6px",
            display: "inline-block",
            fontWeight: 600,
            border: "1px solid #2E8B8B",
            marginBottom: "20px",
          }}
        >
          Account Deletion Request
        </div>

        <p>In the email, include:</p>

        <ul style={{ lineHeight: "1.8", marginBottom: "20px" }}>
          <li>Your ZeniaHub username or registered email</li>
          <li>A statement confirming you want your account deleted</li>
        </ul>

        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: "22px",
            marginBottom: "10px",
            color: "#2E8B8B",
          }}
        >
          Processing Time
        </h2>
        <p style={{ marginBottom: "30px" }}>
          Deletion requests are processed within <strong>7–14 business days</strong>.
          You will receive a confirmation email once deletion is complete.
        </p>

        <div style={{ textAlign: "center", marginTop: "40px", opacity: 0.8 }}>
          © {new Date().getFullYear()} ZeniaHub — Your space for personal growth and productivity. 🤍
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
