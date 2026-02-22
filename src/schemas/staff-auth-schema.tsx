import z from "zod";

export const staffSignupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    idNumber: z.string().min(2, 'ID number must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const staffLoginSchema = z.object({
  idNumber: z.string().min(2, 'ID number must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type StaffLoginFormValues = z.infer<typeof staffLoginSchema>;
export type StaffSignupFormValues = z.infer<typeof staffSignupSchema>;