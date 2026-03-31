"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { useAuth } from "@/contexts/auth-context";
import { createStaff } from "@/services/user-service";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { UserCog } from "lucide-react";

export default function StaffAuthDialog() {
  const [open, setOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { loginStaff } = useAuth();

  async function signupStaff(fullName: string, email: string, password: string) {
    await createStaff(fullName, email, password, 'Super Admin');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="w-full cursor-pointer border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto px-8"
        >
          <UserCog />
          I am a Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{isSignup ? "Create an Account" : "Welcome Back"}</DialogTitle>
          <DialogDescription>
            {isSignup
              ? "Fill in the details below to create your staff account"
              : "Enter your credentials to access your staff account"}
          </DialogDescription>
        </DialogHeader>
        {isSignup ? (
          <SignupForm onSubmit={signupStaff} onSuccess={() => setOpen(false)} />
        ) : (
          <LoginForm onLogin={loginStaff} onSuccess={() => setOpen(false)} />
        )}
        <p className="text-center text-sm text-muted-foreground">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Create one
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
