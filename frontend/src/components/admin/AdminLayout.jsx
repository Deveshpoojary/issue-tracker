import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  LogOut,
  ArrowLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = (() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const navItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      active: location.pathname === "/admin" || location.pathname === "/admin/dashboard",
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
      active: location.pathname === "/admin/users",
    },
    {
      label: "Issues",
      path: "/admin/issues",
      icon: Layers,
      active: location.pathname === "/admin/issues",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="w-full border-b border-neutral-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Brand & Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-bold text-white shadow-xs">
                IT
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-black">
                  Issue Tracker
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-black px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-white">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      item.active
                        ? "bg-neutral-100 text-black font-semibold border border-neutral-200"
                        : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <span className="text-xs text-neutral-600 hidden lg:inline">
                Signed in as <strong className="text-black font-semibold">{currentUser.name || currentUser.email}</strong>
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="h-8 gap-1.5 border-neutral-300 text-xs font-medium text-black hover:bg-neutral-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to</span> App
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1.5 border-neutral-300 text-xs font-medium text-black hover:bg-neutral-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-1.5 text-neutral-700 hover:text-black rounded-md border border-neutral-200"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    item.active
                      ? "bg-neutral-100 text-black font-semibold"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page Header & Content */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {title && (
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
