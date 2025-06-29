'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const translations = {
    title: {
      en: "Login to AgriTotho",
      bn: "এগ্রিটথোতে লগইন করুন"
    },
    email: {
      en: "Email",
      bn: "ইমেইল"
    },
    password: {
      en: "Password",
      bn: "পাসওয়ার্ড"
    },
    login: {
      en: "Login",
      bn: "লগইন"
    },
    noAccount: {
      en: "Don't have an account?",
      bn: "অ্যাকাউন্ট নেই?"
    },
    register: {
      en: "Register",
      bn: "নিবন্ধন করুন"
    },
    emailRequired: {
      en: "Email is required",
      bn: "ইমেইল প্রয়োজন"
    },
    passwordRequired: {
      en: "Password is required",
      bn: "পাসওয়ার্ড প্রয়োজন"
    },
    invalidCredentials: {
      en: "Invalid email or password",
      bn: "ভুল ইমেইল বা পাসওয়ার্ড"
    }
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email) {
      setError(t("emailRequired"));
      setLoading(false);
      return;
    }

    if (!password) {
      setError(t("passwordRequired"));
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push("/farmer/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fcf8]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-[#111b0e] mb-6">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#5f974e]">
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 text-[#111b0e] placeholder:text-[#111b0e] focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#5f974e]">
              {t("password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 text-[#111b0e] placeholder:text-[#111b0e] focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#3db714] hover:bg-[#2f8f0f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3db714] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              t("login")
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[#5f974e]">{t("noAccount")} </span>
          <Link
            href="/register"
            className="text-[#3db714] hover:text-[#2f8f0f] font-medium"
          >
            {t("register")}
          </Link>
        </div>
      </div>
    </div>
  );
} 