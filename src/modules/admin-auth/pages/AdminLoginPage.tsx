import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { KitchenXLogo } from '../components/KitchenXLogo';
import {
  isStaffAppRole,
  loginStaff,
  logoutStaff,
  staffLoginErrorMessage
} from '@/shared/auth/staffAuth';
import { sessionKeys } from '@/shared/auth/sessionKeys';
import { getAccessToken } from '@/shared/auth/tokenStorage';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const fieldWrap =
  'flex min-h-12 items-center gap-2 rounded-xl border border-line bg-[#f6f7f9] px-3 focus-within:border-brand-600/70 focus-within:outline focus-within:outline-2 focus-within:outline-brand-600/30';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function redirectIfSignedIn() {
      if (!getAccessToken()) {
        setCheckingSession(false);
        return;
      }
      try {
        const me = await apiClient.get<{ role: string }>('/auth/me');
        if (!cancelled && isStaffAppRole(me.role)) {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } catch {
        // stale token — stay on login
      }
      if (!cancelled) setCheckingSession(false);
    }
    void redirectIfSignedIn();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid work email.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await loginStaff({ email: trimmedEmail, password });
      if (!isStaffAppRole(result.role)) {
        logoutStaff();
        setError('This account cannot access the admin platform.');
        return;
      }
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(staffLoginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#fffaf7]">
        <p className="text-sm font-medium text-ink-500">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <title>KitchenX Hire | Admin Login</title>
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#fffaf7] px-4 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-[280px] rounded-full bg-[#ff4f18]/[0.12] blur-2xl min-[768px]:size-[340px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-28 size-[260px] rounded-full bg-[#ff4f18]/[0.1] blur-2xl min-[768px]:size-[320px]"
        />

        <div className="relative z-10 mb-8">
          <KitchenXLogo className="h-7 min-[768px]:h-8" />
        </div>

        <div className="relative z-10 w-full max-w-[420px] rounded-[20px] border border-line/80 bg-surface px-6 py-8 shadow-[0_18px_48px_rgb(22_30_50/0.08)] min-[768px]:px-8 min-[768px]:py-9">
          <header className="text-center">
            <h1 // guard-allow: admin login is a standalone public staff page, not admin PageHeader
              className="text-[26px] font-extrabold tracking-tight text-ink"
            >
              Admin Login
            </h1>
            <p className="mt-2 text-[14px] font-medium text-ink-500">
              Sign in to access the KitchenX platform
            </p>
          </header>

          <form className="mt-7 space-y-4" onSubmit={submit} noValidate>
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-[13px] font-bold text-ink">
                Work email
              </label>
              <div className={fieldWrap}>
                <Mail className="size-4 shrink-0 text-ink-400" aria-hidden />
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11 border-0 bg-transparent px-0 shadow-none focus-visible:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-[13px] font-bold text-ink"
              >
                Password
              </label>
              <div className={fieldWrap}>
                <Lock className="size-4 shrink-0 text-ink-400" aria-hidden />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:outline-none"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-500 hover:bg-muted"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] font-semibold text-danger-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
              className={cn(
                'mt-2 min-h-[46px] w-full rounded-xl text-[15px] font-bold shadow-[0_10px_24px_rgb(255_79_24/0.35)]'
              )}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" aria-hidden />
            <span className="text-[13px] font-medium text-ink-400">or</span>
            <span className="h-px flex-1 bg-line" aria-hidden />
          </div>

          <p className="mt-6 text-center text-[13px] leading-relaxed font-medium text-ink-500">
            Accounts are created by a platform admin.
            <br />
            Contact your admin to get access.
          </p>
        </div>
      </div>
    </>
  );
}
