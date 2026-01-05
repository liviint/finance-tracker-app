"use client"
import React, { useState } from "react";
import { api } from "api";
import { validateEmail } from "@/helpers";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validateForm = () => {
    let newErrors = {};
    
    let isEmailValid = validateEmail(formData.email)
    if(isEmailValid.errorMessage) newErrors.email = isEmailValid.errorMessage 

    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");
    setSuccess(false);
      api.post("/accounts/register/", {...formData,email: formData.email.trim().toLowerCase()})
      .then(res => {
        setSuccess(true);
        setFormData({ username: "", email: "", password: "" });
      })
      .catch ((error)=> {
          console.log(error.response, "hello error");

          const data = error?.response?.data;

          let errMsg = "Something went wrong. Please try again.";

          if (data && typeof data === "object") {
            // Get first error message from any field
            const firstKey = Object.keys(data)[0];
            if (Array.isArray(data[firstKey])) {
              errMsg = data[firstKey][0];
            }
          }

          setServerError(errMsg);
        })
    .finally(() => setLoading(false)
    )
  };

  return (
    <div className={"form-container"}>
      <div className={"form"} >
        <h2>Create an Account</h2>

        {serverError && <p className={"error"}>{serverError}</p>}
        {success && <p className={"success"}>A verification link has been sent to your email.</p>}

        <div className={"formGroup"}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <small className={"error"}>{errors.email}</small>}
        </div>

        <div className={"formGroup"}>
          <label>Password</label>
          <div className="passwordWrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={formData.password}
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
            {errors.password && <small className={"error"}>{errors.password}</small>}
          </div>
        </div>

        <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className={"btn"}
            type="button"
          >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default Signup;
