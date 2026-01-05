'use client'
import React, { useState } from "react";
import { useSearchParams } from 'next/navigation';
import { api } from "api";
import { useRouter } from "next/navigation";

const ResetPasswordConfirm = () => {
  const router = useRouter()
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.new_password || !formData.confirm_password) {
      setError("All fields are required.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.new_password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

      setLoading(true);
      await api.post("/accounts/password-reset-confirm/", {
        uid,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      }).then(() => {
        setSuccess("Your password has been successfully reset!");
        setFormData({ new_password: "", confirm_password: "" });
        setTimeout(() => router.push("login"),3000)
      })
      .catch ((err) => {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      )
    }) 
    .finally( () =>{
      setLoading(false);
    })
  }

  return (
    <div className={"form-container"}>
      <form className={"form"} onSubmit={handleSubmit}>
        <h2>Set a New Password</h2>

        {error && <p className={"error"}>{error}</p>}
        {success && <p className={"success"}>{success}</p>}

        <div className={"formGroup"}>
          <label>New Password</label>
          <div className="passwordWrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="new_password"
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={handleChange}
            />
            <button
                type="button"
                className="togglePassword"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className={"formGroup"}>
          <label>Confirm Password</label>
          <div className="passwordWrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm new password"
              value={formData.confirm_password}
              onChange={handleChange}
            />
            <button
                type="button"
                className="togglePassword"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className={"btn"}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className={"hint"}>
          <a href="/login" className={"link"}>
            Back to Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default ResetPasswordConfirm;
