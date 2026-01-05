'use client';
import React, { useState } from "react";
import { api } from "api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserDetails } from "@/store/features/userSlice";
import { validateEmail } from "@/helpers";

const Login = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({ email: "", password: "" });
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
        const newErrors = {};
        let isEmailValid = validateEmail(formData.email)
        if(isEmailValid.errorMessage)  newErrors.email = isEmailValid.errorMessage 

        if (!formData.password.trim()) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setServerError("");
        setSuccess(false);

        try {
        const response = await api.post("accounts/login/", {...formData,email: formData.email.trim().toLowerCase()});
        localStorage.setItem("token", response.data.access);
        setSuccess(true);
        dispatch(setUserDetails(response.data));
        router.push('/profile');
        setFormData({ email: "", password: "" });
        } catch (error) {
        setServerError(
            error.response?.data?.message || "Invalid credentials. Please try again."
        );
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className={"form-container"}>
        <form className={"form"} onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>

            {serverError && <p className={"error"}>{serverError}</p>}
            {success && <p className={"success"}>Login successful!</p>}

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
            <p className="hint" style={{ textAlign: "right", marginTop: "-5px" }}>
            <a href="/reset-password" className="link">Forgot password?</a>
            </p>

            <button type="submit" disabled={loading} className={"btn"}>
            {loading ? "Logging in..." : "Login"}
            </button>

            {/* <div style={{ margin: "15px 0", textAlign: "center" }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
            />
            </div> */}

            <p className={"hint"}>
            Don’t have an account?{" "}
            <a href="/signup" className={"link"}>Sign up</a>
            </p>
        </form>
        </div>
    );
};

export default Login;
