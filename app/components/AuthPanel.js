"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function AuthPanel() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [status, setStatus] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!supabase) {
    return (
      <div className="glass rounded-2xl border border-slate-700/60 p-6">
        <p className="text-sm font-semibold text-orange-200">Supabase not configured</p>
        <p className="text-xs text-slate-300">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use authentication.
        </p>
      </div>
    );
  }

  const handleEmailPassword = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setStatus("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Signed in!");
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setStatus("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
    });
    setStatus(error ? error.message : "Check your email for the magic link.");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="glass rounded-2xl border border-slate-700/60 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-200">Supabase Auth</p>
          <p className="text-xs text-slate-300">Email/password and passwordless magic links.</p>
        </div>
        {session?.user ? (
          <button
            onClick={handleSignOut}
            className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-slate-600"
          >
            Sign out
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form className="space-y-3" onSubmit={handleEmailPassword}>
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              required
            />
          </div>
          <button className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-glow hover:bg-orange-400">
            Sign in / Sign up
          </button>
        </form>

        <form className="space-y-3" onSubmit={handleMagicLink}>
          <div>
            <label className="text-xs text-slate-300">Passwordless magic link</label>
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              required
            />
          </div>
          <button className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-50 ring-1 ring-slate-700 hover:bg-slate-700">
            Send magic link
          </button>
        </form>
      </div>
      <p className="mt-4 text-xs text-slate-300">{status}</p>
      {session?.user ? (
        <div className="mt-3 rounded-lg bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
          Signed in as {session.user.email}
        </div>
      ) : null}
    </div>
  );
}
