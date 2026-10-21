import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-10 text-black">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-xs">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-black">
            Issue Tracker
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Sign in to manage and track your project issues.
          </p>
        </div>

        <Card className="gap-0 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold text-black">
              Sign in
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pt-4 pb-6">
            <LoginForm />
            <p className="mt-5 text-center text-sm text-neutral-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-black underline underline-offset-4 hover:text-neutral-700"
              >
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
