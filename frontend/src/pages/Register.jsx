import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-4 py-10 text-black">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Issue Tracker
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Create an account to get started.
          </p>
        </div>

        <Card className="gap-0 rounded-2xl border border-neutral-200 bg-white py-0 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-2 text-left">
            <CardTitle className="text-lg font-bold text-black">
              Create account
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pt-4 pb-6">
            <RegisterForm />
            <p className="mt-5 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-black underline underline-offset-4 hover:text-neutral-700"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
