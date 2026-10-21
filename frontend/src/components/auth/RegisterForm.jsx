import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.register(name.trim(), email.trim(), password);

      // Automatically log in to get JWT token
      try {
        const loginData = await api.login(email.trim(), password);
        if (loginData?.token) {
          localStorage.setItem("token", loginData.token);
        }
        if (loginData?.user) {
          localStorage.setItem("user", JSON.stringify(loginData.user));
        }
        setSuccess("Account created successfully! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      } catch {
        // Fallback to login page if auto-login fails
        setSuccess("Account created successfully! Redirecting to sign in...");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-black/20 bg-neutral-100 p-3 text-xs text-neutral-900">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-black bg-black p-3 text-xs text-white">
          {success}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium text-black">
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
          className="h-10 rounded-lg border-neutral-300 bg-white text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-black">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="h-10 rounded-lg border-neutral-300 bg-white text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-black">
          Password <span className="font-normal text-neutral-400"></span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            className="h-10 rounded-lg border-neutral-300 bg-white pr-10 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-lg bg-black text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
