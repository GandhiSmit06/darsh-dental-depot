"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { doctorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileSettings({ openWebsite }: { openWebsite?: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  if (!user) return null;
  const clinic = user.role === "doctor";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") || "").trim();
    if (!name) {
      setMessage("Enter your full name.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await doctorApi.updateProfile({
        name,
        ...(clinic && { clinicName: String(fields.get("clinicName") || "").trim() }),
      });
      await refreshProfile();
      setMessage("Profile saved.");
    } catch {
      setMessage("Couldn’t save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-2xl space-y-5">
      <h1>Account settings</h1>
      <Card className="p-5 sm:p-7">
        <form onSubmit={save} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              name="name"
              defaultValue={user.fullName}
              required
              autoComplete="name"
            />
          </div>
          {clinic && (
            <div className="space-y-2">
              <Label htmlFor="profile-clinic">Clinic name</Label>
              <Input
                id="profile-clinic"
                name="clinicName"
                defaultValue={user.clinicName}
                autoComplete="organization"
              />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Account email</p>
            <p className="break-words text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button disabled={saving} type="submit">
            {saving ? "Saving…" : "Save profile"}
          </Button>
          <p role="status" className="text-sm">
            {message}
          </p>
        </form>
      </Card>
      {openWebsite && (
        <Button variant="outline" onClick={openWebsite}>
          Manage website content and depot contact details
        </Button>
      )}
    </section>
  );
}
