import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, GraduationCap } from "lucide-react";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <Mail className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Check your email
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              We&apos;ve sent you a confirmation link to verify your email address
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click the link in your email to complete your registration and start preparing for interviews.
          </p>
          <Button asChild variant="outline" className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Link href="/auth/login">
              <GraduationCap className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
