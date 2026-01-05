'use client'
import React, { useState } from "react";
import { api } from "api";
import { validateEmail } from "@/helpers";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let isEmailValid = validateEmail(email)
    if (!isEmailValid.isValid) {
      setError(isEmailValid.errorMessage);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/accounts/password-reset/", {email: email.trim().toLowerCase()});
      setSuccess("If that email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"form-container"}>
      <form className={"form"} onSubmit={handleSubmit}>
        <h2>Reset Your Password</h2>

        {error && <p className={"error"}>{error}</p>}
        {success && <p className={"success"}>{success}</p>}

        <div className={"formGroup"}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className={"btn"} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p className={"hint"}>
          Remember your password?{" "}
          <a href="/login" className={"link"}>
            Back to Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
