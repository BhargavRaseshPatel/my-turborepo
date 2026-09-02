"use client";

import { AuthFormInput } from "@/components/auth-form-input";
import {
  AuthSubmitButton,
  AuthToggleButton,
} from "@/components/auth-form-controls";
import { AUTH_API } from "@repo/config";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

export default function AuthScreen() {
  const router = useRouter();
  const [signInScreen, setSignInScreen] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const endpoint = signInScreen ? AUTH_API.signin : AUTH_API.signup;

    const payload = signInScreen
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          username: formData.name,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      console.log("Auth success:", data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="auth-screen-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">T</div>
          <span>Trello</span>
        </div>

        <div className="auth-header">
          <h1>{signInScreen ? "Welcome back" : "Create your account"}</h1>
          <p>
            {signInScreen
              ? "Sign in to continue managing your boards and tasks."
              : "Start organizing your team with smarter planning."}
          </p>
        </div>

        <div className="auth-toggle-group">
          <AuthToggleButton active={signInScreen} onClick={() => setSignInScreen(true)}>
            Sign In
          </AuthToggleButton>
          <AuthToggleButton active={!signInScreen} onClick={() => setSignInScreen(false)}>
            Sign Up
          </AuthToggleButton>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!signInScreen && (
            <AuthFormInput
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              required
            />
          )}

          <AuthFormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <AuthFormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete={signInScreen ? "current-password" : "new-password"}
            required
            minLength={6}
          />

          {!signInScreen && (
            <AuthFormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              minLength={6}
            />
          )}

          <AuthSubmitButton>{signInScreen ? "Sign In" : "Create Account"}</AuthSubmitButton>

          <p className="auth-cta-text">
            {signInScreen ? "Don’t have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setSignInScreen((prev) => !prev)}
              className="auth-link-btn"
            >
              {signInScreen ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

