'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { SignupFormValues, signupSchema } from '@/schemas/auth-schema';

interface SignupFormProps {
  onSubmit: (fullName: string, email: string, password: string) => Promise<void>;
  onSuccess?: () => void;
}

export function SignupForm({ onSubmit, onSuccess }: SignupFormProps) {
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onFormSubmit(values: SignupFormValues) {
    setError(null);

    try {
      await onSubmit(values.fullName, values.email, values.password);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <fieldset disabled={isSubmitting} className="space-y-4">
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
          <Input
            {...register('fullName')}
            id="fullName"
            type="text"
            aria-invalid={!!errors.fullName}
            placeholder="Enter your full name"
          />
          <FieldError errors={[errors.fullName]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            {...register('email')}
            id="email"
            type="email"
            aria-invalid={!!errors.email}
            placeholder="Enter your email"
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            {...register('password')}
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            placeholder="Create a password"
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            aria-invalid={!!errors.confirmPassword}
            placeholder="Confirm your password"
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <Button type="submit" className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </fieldset>
    </form>
  );
}
