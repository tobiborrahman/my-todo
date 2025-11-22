'use client'

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Link from 'next/link';

const signupSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  if (isAuthenticated) {
    router.push('/todos');
    return null;
  }

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    setIsLoading(true);
    try {
      await signup({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      });
      router.push('/todos');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex w-full max-w-[606px] bg-[#E2ECF8] items-center justify-center p-12">
        <div>
          <Image
            src="/create-account-illustration.png"
            alt="Create account illustration"
            width={720}
            height={560}
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center">
            <h1 className="text-3xl md:text-[30px] font-bold text-[#0D224A]">Create your account</h1>
            <p className="mt-2 text-sm text-[#4B5563]">Start managing your tasks efficiently</p>
          </div>

          <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                autoComplete="given-name"
                {...register('first_name')}
                error={errors.first_name?.message as any}
              />
              <Input
                label="Last Name"
                type="text"
                autoComplete="family-name"
                {...register('last_name')}
                error={errors.last_name?.message as any}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message as any}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message as any}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message as any}
              />
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                className="w-full rounded-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 text-white shadow-md"
                isLoading={isLoading}
              >
                Sign Up
              </Button>
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

