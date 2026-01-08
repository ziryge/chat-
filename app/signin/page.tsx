import { SignInForm } from '@/components/auth/signin-form';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Devsquare
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back
          </p>
        </div>
        <SignInForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
