import { SignUpForm } from '@/components/auth/signup-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Devsquare
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join the developer community
          </p>
        </div>
        <SignUpForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <a href="/signin" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
