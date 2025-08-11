import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import type { LoginRequest } from '@/types/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<LoginRequest>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(data);
      // No navigation here, the useEffect will handle it.
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
       <div className="flex items-center gap-2 mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
          <ShieldCheck className="h-8 w-8 text-blue-500" />
          <h1>AI-Powered Design Tool</h1>
        </div>
      <Card className="w-full max-w-sm border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue to your design canvas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...register('email')}
                className="dark:bg-gray-900"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                {...register('password')}
                className="dark:bg-gray-900"
              />
            </div>
            {error && <p className="text-red-500 text-sm animate-pulse">{error}</p>}
            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
