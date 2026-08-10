"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupWithProfile, type SignupState } from "@/lib/auth-actions";

const initial: SignupState = {};

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupWithProfile, initial);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
            First name
          </label>
          <input id="firstName" name="firstName" required className={field} />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
            Last name
          </label>
          <input id="lastName" name="lastName" required className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Username
        </label>
        <input id="username" name="username" autoComplete="username" required className={field} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={4}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className="mb-1.5 block text-sm font-medium">
            Gender
          </label>
          <select id="gender" name="gender" required className={field} defaultValue="">
            <option value="" disabled>
              Select
            </option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="mb-1.5 block text-sm font-medium">
            Date of birth
          </label>
          <input id="dateOfBirth" name="dateOfBirth" type="date" required className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="contactNumber" className="mb-1.5 block text-sm font-medium">
          Contact number
        </label>
        <input id="contactNumber" name="contactNumber" type="tel" required className={field} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input id="whatsappAvailable" name="whatsappAvailable" type="checkbox" className="size-4" />
        WhatsApp available on this number
      </label>

      <div>
        <label htmlFor="addressLine1" className="mb-1.5 block text-sm font-medium">
          Address <span className="text-muted-foreground">(optional)</span>
        </label>
        <input id="addressLine1" name="addressLine1" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
            City <span className="text-muted-foreground">(optional)</span>
          </label>
          <input id="city" name="city" className={field} />
        </div>
        <div>
          <label htmlFor="country" className="mb-1.5 block text-sm font-medium">
            Country <span className="text-muted-foreground">(optional, e.g. IN)</span>
          </label>
          <input id="country" name="country" maxLength={2} className={field} />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {typeof state.error === "string" ? state.error : "Could not create account."}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="pt-1 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
