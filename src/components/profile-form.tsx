"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { updateProfile, type ProfileInput, type ProfileState } from "@/lib/auth-actions";

const initial: ProfileState = {};
const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-primary focus:ring-2";

type Option = { code: string; name: string };
type GenderOption = { code: string; label: string };

export function ProfileForm({ profile }: { profile: ProfileInput }) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  const [countries, setCountries] = useState<Option[]>([]);
  const [genders, setGenders] = useState<GenderOption[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [statesCountry, setStatesCountry] = useState("");
  const [country, setCountry] = useState(profile.country || "");
  const [stateCode, setStateCode] = useState(profile.state || "");
  const [optionsError, setOptionsError] = useState(false);

  useEffect(() => {
    fetch("/api/registration-options")
      .then((response) => {
        if (!response.ok) throw new Error("options");
        return response.json();
      })
      .then((options) => {
        setCountries(options.countries);
        setGenders(options.genders);
      })
      .catch(() => setOptionsError(true));
  }, []);

  useEffect(() => {
    if (!country) return;
    fetch(`/api/registration-options/${country}/states`)
      .then((response) => response.json())
      .then((options) => {
        setStates(options.states);
        setStatesCountry(country);
      })
      .catch(() => {
        setStates([]);
        setStatesCountry(country);
      });
  }, [country]);

  useEffect(() => {
    if (!country || statesCountry !== country) return;
    if (stateCode && !states.some((option) => option.code === stateCode)) {
      setStateCode("");
    }
  }, [country, stateCode, states, statesCountry]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="preferredLanguage" value={profile.preferredLanguage || "en"} />
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Username
        </label>
        <input id="username" value={profile.username} readOnly className={`${field} bg-muted`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
            First name
          </label>
          <input id="firstName" name="firstName" required defaultValue={profile.firstName} className={field} />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
            Last name
          </label>
          <input id="lastName" name="lastName" required defaultValue={profile.lastName} className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={profile.email}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className="mb-1.5 block text-sm font-medium">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            required
            className={field}
            key={genders.length ? "ready" : "loading"}
            defaultValue={profile.gender}
          >
            <option value="" disabled>
              {genders.length ? "Select" : "Loading…"}
            </option>
            {genders.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="mb-1.5 block text-sm font-medium">
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            defaultValue={profile.dateOfBirth}
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contactNumber" className="mb-1.5 block text-sm font-medium">
          Contact number
        </label>
        <input
          id="contactNumber"
          name="contactNumber"
          type="tel"
          required
          defaultValue={profile.contactNumber}
          className={field}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          id="whatsappAvailable"
          name="whatsappAvailable"
          type="checkbox"
          defaultChecked={profile.whatsappAvailable}
          className="size-4"
        />
        WhatsApp available on this number
      </label>

      <div>
        <label htmlFor="addressLine1" className="mb-1.5 block text-sm font-medium">
          Address <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="addressLine1"
          name="addressLine1"
          defaultValue={profile.addressLine1 || ""}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium">
            City <span className="text-muted-foreground">(optional)</span>
          </label>
          <input id="city" name="city" defaultValue={profile.city || ""} className={field} />
        </div>
        <div>
          <label htmlFor="country" className="mb-1.5 block text-sm font-medium">
            Country <span className="text-muted-foreground">(optional)</span>
          </label>
          <select
            id="country"
            name="country"
            className={field}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            <option value="">Select country</option>
            {countries.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="state" className="mb-1.5 block text-sm font-medium">
            State / Province <span className="text-muted-foreground">(optional)</span>
          </label>
          <select
            id="state"
            name="state"
            value={statesCountry === country ? stateCode : ""}
            onChange={(event) => setStateCode(event.target.value)}
            disabled={!country || statesCountry !== country || !states.length}
            className={field}
          >
            <option value="">
              {!country
                ? "Select country first"
                : statesCountry !== country
                  ? "Loading…"
                  : states.length
                    ? "Select state"
                    : "Not available"}
            </option>
            {statesCountry === country &&
              states.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="text-sm font-medium">Change password</p>
        <p className="mt-1 text-xs text-muted-foreground">Leave blank to keep your current password.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={4}
              className={field}
            />
          </div>
        </div>
      </div>

      {optionsError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Profile options could not be loaded. Please refresh and try again.
        </p>
      ) : state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : state.saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Profile saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
