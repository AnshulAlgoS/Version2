import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2, Figma, FileCode2, Database, Terminal, Globe } from "lucide-react";
import { Scribble } from "@/components/ui/Scribble";

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-content > *", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });
      
      gsap.from(".hero-tag", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.7)",
        delay: 1
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center p-4 pt-20 overflow-hidden" ref={containerRef}>
      <div className="w-full px-4 md:px-12 lg:px-24 relative z-10 h-full flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 w-full">
            
            {/* Left Column: Content */}
            <div className="hero-content space-y-6 lg:max-w-[60%] shrink-0">
              {/* Header Logo/Brand */}
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-red-600"></div>
                <span className="font-mono text-sm tracking-[0.2em] text-red-500 uppercase font-bold">System V2.0 // Online</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9] drop-shadow-2xl">
                <div>Measure the</div>
                <div className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">
                  <span className="relative z-10">Distance</span>
                </div>
                <div>Between Who</div>
                <div className="text-white/90">You Are & Who</div>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                  You Want To Be
                </div>
              </h1>

              {/* Subtext with futuristic border */}
              <div className="relative pl-6 border-l-2 border-red-600/50">
                <p className="max-w-xl text-lg text-white/70 font-light leading-relaxed">
                  Upload your resume. Compare with your dream career. Get a precise roadmap with <span className="text-white font-medium">time estimates</span>, <span className="text-white font-medium">skill gaps</span>, and <span className="text-white font-medium">semester-wise tracking</span>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-8 text-base font-bold bg-red-600 hover:bg-red-700 text-white rounded-none uppercase tracking-widest transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500">
                    Start Journey
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-base font-bold border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white/10 rounded-none uppercase tracking-widest gap-3 hover:border-red-500/50 transition-all">
                  <Play className="w-5 h-5 fill-current" />
                  Watch Demo
                </Button>
              </div>

              {/* Bottom Stats Grid - Compact */}
              <div className="flex flex-wrap gap-8 border-t border-white/10 pt-6 mt-4">
                {[
                  { value: "10k+", label: "Career Paths" },
                  { value: "95%", label: "Accuracy" },
                  { value: "2.5x", label: "Faster Growth" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-2xl font-mono font-bold text-white tracking-tighter">{stat.value}</span>
                    <span className="text-[10px] uppercase tracking-widest text-red-500/80 font-bold">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Floating Visual Elements */}
            <div className="relative hidden lg:block h-[500px] w-full max-w-[40%] perspective-1000 pointer-events-none">
               {/* HUD Circle */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-dashed border-red-500/20 animate-[spin_15s_linear_infinite_reverse]" />
               
               {/* Floating Cards / Data Points */}
               <div className="absolute top-20 right-10 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg animate-bounce duration-[3000ms]">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-xs font-mono text-white/60">LIVE ANALYSIS</span>
                 </div>
                 <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full w-[70%] bg-red-600 rounded-full" />
                 </div>
               </div>

               <div className="absolute bottom-40 left-0 p-6 bg-black/40 backdrop-blur-md border border-red-500/30 rounded-lg border-l-4 border-l-red-600">
                 <div className="text-4xl font-black text-white mb-1">85%</div>
                 <div className="text-xs font-mono text-white/60 uppercase tracking-wider">Match Score</div>
               </div>
            </div>
            
        </div>
      </div>
      
      {/* Decorative Side Elements */}
      <div className="absolute left-8 bottom-8 hidden md:flex flex-col gap-4 text-white/20 font-mono text-xs rotate-180" style={{ writingMode: 'vertical-rl' }}>
        <span>SCROLL TO EXPLORE</span>
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>

    </section>
  );
};

export default HeroSection;