import Image from "next/image"
import { LoginForm } from "./LoginForm"
import gopLogo from "@/img/gop-logo.png"
import prmscLogo from "@/img/prmsc-logo.png"

const logoShadow = {
  filter: "drop-shadow(0 4px 14px rgba(255, 255, 255, 0.35))",
}

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{ background: "#F4F6F8" }}
    >
      {/* LEFT PANEL — brand panel (hidden on mobile) */}
      <div
        className="relative hidden overflow-hidden md:flex md:w-[45%] lg:w-[55%]"
        style={{
          background: "linear-gradient(180deg, #1B5E20 0%, #0D3B12 100%)",
        }}
      >
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-10 text-center">
          <div className="flex items-center gap-6">
            <Image
              src={gopLogo}
              alt="Government of the Punjab"
              style={{ ...logoShadow, height: 80, width: "auto" }}
              priority
            />
            <Image
              src={prmscLogo}
              alt="PRMSC"
              style={{ ...logoShadow, height: 80, width: "auto" }}
              priority
            />
          </div>

          <div
            className="h-px w-full max-w-[200px]"
            style={{ background: "rgba(255, 255, 255, 0.4)" }}
          />

          <div>
            <h1
              className="font-bold text-white"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: 22,
                letterSpacing: 2,
                lineHeight: 1.4,
              }}
            >
              PUNJAB RURAL MUNICIPAL
              <br />
              SERVICES COMPANY
            </h1>
          </div>

          <div style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            <p
              className="uppercase text-white"
              style={{ fontSize: 12, letterSpacing: 1, opacity: 0.7 }}
            >
              Local Government &amp; Community Development Department
            </p>
            <p
              className="mt-1 text-white"
              style={{ fontSize: 11, opacity: 0.5 }}
            >
              Government of the Punjab
            </p>
          </div>
        </div>

        {/* Decorative overlapping circles, bottom-left */}
        <svg
          className="pointer-events-none absolute -bottom-24 -left-24 z-0"
          width="300"
          height="300"
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="120" cy="120" r="100" fill="#FFFFFF" opacity="0.05" />
          <circle cx="180" cy="160" r="100" fill="#FFFFFF" opacity="0.05" />
          <circle cx="140" cy="200" r="100" fill="#FFFFFF" opacity="0.05" />
        </svg>

        {/* Bottom pill badge */}
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <span
            className="rounded-full px-4 py-1 text-white"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Visitor Management System
          </span>
        </div>
      </div>

      {/* RIGHT PANEL — login form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-8 py-12 sm:px-12 md:w-[55%] lg:w-[45%]">
        <div className="w-full max-w-sm">
          {/* Mobile-only condensed branding (left panel is hidden below md) */}
          <div className="mb-6 flex flex-col items-center gap-2 text-center md:hidden">
            <div className="flex items-center gap-3">
              <Image
                src={gopLogo}
                alt="Government of the Punjab"
                style={{ height: 48, width: "auto" }}
              />
              <Image
                src={prmscLogo}
                alt="PRMSC"
                style={{ height: 48, width: "auto" }}
              />
            </div>
            <h2
              className="font-bold"
              style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: 16,
                color: "#1A1A2E",
                letterSpacing: 1,
              }}
            >
              PUNJAB RURAL MUNICIPAL SERVICES COMPANY
            </h2>
          </div>

          <Image
            src={prmscLogo}
            alt="PRMSC"
            style={{ height: 32, width: "auto" }}
            className="mb-5"
          />

          <h1
            className="font-bold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 28,
              color: "#1A1A2E",
            }}
          >
            Welcome Back
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              color: "#546E7A",
            }}
          >
            Sign in to your account
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <div
            className="mt-10 border-t pt-4 text-center"
            style={{ borderColor: "#E5E7EB" }}
          >
            <p
              className="uppercase"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 11,
                color: "#9CA3AF",
                letterSpacing: 0.5,
              }}
            >
              PRMSC Internal System — Authorized Personnel Only
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 10,
                color: "#D1D5DB",
              }}
            >
              © {new Date().getFullYear()} Punjab Rural Municipal Services
              Company
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
