'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const translations = {
    title: {
      en: "Create an Account",
      bn: "অ্যাকাউন্ট তৈরি করুন"
    },
    name: {
      en: "Full Name",
      bn: "পূর্ণ নাম"
    },
    email: {
      en: "Email",
      bn: "ইমেইল"
    },
    password: {
      en: "Password",
      bn: "পাসওয়ার্ড"
    },
    phone: {
      en: "Phone Number",
      bn: "ফোন নম্বর"
    },
    role: {
      en: "Role",
      bn: "ভূমিকা"
    },
    farmer: {
      en: "Farmer",
      bn: "কৃষক"
    },
    dealer: {
      en: "Dealer",
      bn: "ডিলার"
    },
    register: {
      en: "Register",
      bn: "নিবন্ধন"
    },
    haveAccount: {
      en: "Already have an account?",
      bn: "ইতিমধ্যে অ্যাকাউন্ট আছে?"
    },
    login: {
      en: "Login",
      bn: "লগইন"
    },
    requiredFields: {
      en: "All fields are required",
      bn: "সব ক্ষেত্র পূরণ করা আবশ্যক"
    },
    userExists: {
      en: "User with this email or phone number already exists",
      bn: "এই ইমেইল বা ফোন নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে"
    },
    invalidEmail: {
      en: "Please enter a valid email address",
      bn: "একটি বৈধ ইমেইল ঠিকানা লিখুন"
    },
    passwordLength: {
      en: "Password must be at least 6 characters long",
      bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
    }
  };

  const t = (key: keyof typeof translations) => translations[key][language];

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const phoneNumber = formData.get("phoneNumber") as string;
      const role = formData.get("role") as string;

      // Validate required fields
      if (!name || !email || !password || !phoneNumber || !role) {
        setError(t("requiredFields"));
        return;
      }

      // Validate email format
      if (!validateEmail(email)) {
        setError(t("invalidEmail"));
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setError(t("passwordLength"));
        return;
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect to login page on successful registration
      router.push("/login");
    } catch (error: any) {
      setError(error.message === "User with this email or phone number already exists"
        ? t("userExists")
        : error.message);
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
            <label htmlFor="name" className="block text-sm font-medium text-[#5f974e]">
              {t("name")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 text-[#111b0e] placeholder:text-[#111b0e] focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#5f974e]">
              {t("email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
              required
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
              minLength={6}
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 text-[#111b0e] placeholder:text-[#111b0e] focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#5f974e]">
              {t("phone")}
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 text-[#111b0e] placeholder:text-[#111b0e] focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-[#5f974e]">
              {t("role")}
            </label>
            <select
              id="role"
              name="role"
              className="mt-1 block w-full rounded-md border border-[#d5e7d0] shadow-sm p-2 text-[#111b0e] focus:border-[#3db714] focus:ring focus:ring-[#3db714] focus:ring-opacity-50"
              required
            >
              <option value="FARMER">{t("farmer")}</option>
              <option value="DEALER">{t("dealer")}</option>
            </select>
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
              t("register")
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[#5f974e]">{t("haveAccount")} </span>
          <Link
            href="/login"
            className="text-[#3db714] hover:text-[#2f8f0f] font-medium"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    </div>
  );
} 