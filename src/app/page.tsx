'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Redirect based on user role
    switch ((session.user as any).role) {
      case "FARMER":
        router.push("/farmer/dashboard");
        break;
      case "DEALER":
        router.push("/dealer/dashboard");
        break;
      case "ADMIN":
        router.push("/admin/dashboard");
        break;
      default:
        router.push("/login");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fcf8]">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-[#3db714] rounded-full animate-bounce" />
        <div className="w-4 h-4 bg-[#3db714] rounded-full animate-bounce [animation-delay:-.3s]" />
        <div className="w-4 h-4 bg-[#3db714] rounded-full animate-bounce [animation-delay:-.5s]" />
      </div>
    </div>
  );
}
