"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const router = useRouter();


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#020617] overflow-hidden text-white">

      {/* Animated tech grid background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse pointer-events-none"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#0eff0a] rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl text-center px-8 animate-fade-in">
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="text-[#0aff43] drop-shadow-[0_0_8px_#0aff2f]">
            SG
          </span>{" "}
          <span className="text-white">Technologies</span>
        </h1>

        <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
          Innovating retail solutions with cutting-edge performance,  
          cloud-ready architectures, and seamless user experiences.
          <br />
          Redirecting you to your secure dashboard login…
        </p>

        <div className="mt-8">
          <Button
            variant="primary"
            className="px-10 py-3 text-lg bg-[#0aff2f] hover:bg-[#00db12] shadow-[0_0_20px_#0aff2f] transition-all hover:scale-105"
            onClick={() => router.push("/login")}
          >
            Login Now
          </Button>
        </div>
      </div>

      {/* Bottom neon wave */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-30"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#0aff2f"
          d="M0,128L80,144C160,160,320,192,480,181.3C640,171,800,117,960,85.3C1120,53,1280,43,1360,37.3L1440,32V320H0Z"
        ></path>
      </svg>
    </div>
  );
}
