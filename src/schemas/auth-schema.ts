import z from "zod";

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
