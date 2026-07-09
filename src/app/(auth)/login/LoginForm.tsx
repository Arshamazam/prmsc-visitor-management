"use client"

import { useActionState, useState } from "react"
import { loginAction } from "@/lib/actions/auth.actions"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"

type LoginState = { error?: string }

const initialState: LoginState = {}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (_prevState, formData) => {
      const result = await loginAction(formData)
      return result ?? {}
    },
    initialState
  )

  return (
    <form action={formAction} className="prmsc-login-form space-y-5">
      <style>{`
        .prmsc-login-form input {
          border: 1.5px solid #E5E7EB;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          width: 100%;
          transition: all 0.2s ease;
          color: #1A1A2E;
        }
        .prmsc-login-form input::placeholder {
          color: #9CA3AF;
        }
        .prmsc-login-form input:focus {
          outline: none;
          border-color: #2E7D32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }
        .prmsc-login-form label {
          font-family: var(--font-inter), sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }
        .prmsc-signin-btn {
          width: 100%;
          background: linear-gradient(135deg, #1B5E20, #2E7D32);
          color: #fff;
          padding: 12px;
          border-radius: 8px;
          font-family: var(--font-inter), sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .prmsc-signin-btn:hover:not(:disabled) {
          background: #155724;
          box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
          transform: translateY(-1px);
        }
        .prmsc-signin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .prmsc-toggle-visibility {
          color: #9CA3AF;
          transition: color 0.2s ease;
        }
        .prmsc-toggle-visibility:hover {
          color: #374151;
        }
      `}</style>

      <div>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@prmsc.gov.pk"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="pr-10!"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="prmsc-toggle-visibility absolute top-1/2 right-3 -translate-y-1/2"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {state?.error && (
        <div
          className="flex items-center gap-1.5 rounded-md px-3.5 py-2.5 text-[13px]"
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderLeft: "3px solid #DC2626",
            color: "#DC2626",
          }}
        >
          <AlertCircle className="size-3.5 shrink-0" />
          {state.error}
        </div>
      )}

      <button type="submit" className="prmsc-signin-btn" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  )
}
