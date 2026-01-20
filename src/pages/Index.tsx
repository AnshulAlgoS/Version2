import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import PixelNavbar from "@/components/layout/PixelNavbar";
import ReactiveWeb from "@/components/ui/ReactiveWeb";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Swords, Scroll, Gamepad2, BrainCircuit, Target, User } from "lucide-react";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5,
      });
      
      gsap.from(".hero-card", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 1,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent font-sans overflow-x-hidden flex flex-col">
      <ReactiveWeb />
      <PixelNavbar />

      <main ref={heroRef} className="relative z-10 flex-grow pt-32 px-6 container mx-auto">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-32">
          <div className="inline-block bg-yellow-300 border-2 border-black px-4 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 hero-text">
            <span className="font-bold uppercase tracking-widest text-sm">Level Up Your Career</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black font-display uppercase leading-tight mb-8 hero-text drop-shadow-sm">
            Don't Just Apply.<br />
            <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600" style={{ WebkitTextStroke: "2px black" }}>Play to Win.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-10 hero-text max-w-2xl mx-auto">
            Your personalized career RPG. Compare your resume, track your XP, and defeat the boss (interviews).
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 hero-text">
             <Link to="/auth">
               <div className="group relative">
                 <div className="absolute inset-0 bg-black translate-x-2 translate-y-2" />
                 <div className="relative border-4 border-black bg-primary px-8 py-4 text-white font-display font-black text-xl uppercase tracking-widest hover:-translate-y-1 hover:translate-x-1 transition-all flex items-center gap-3">
                   Start Game <ArrowRight className="w-6 h-6" />
                 </div>
               </div>
             </Link>
             
             <Link to="/resume-comparator">
               <div className="group relative">
                 <div className="absolute inset-0 bg-black/20 translate-x-2 translate-y-2" />
                 <div className="relative border-4 border-black bg-white px-8 py-4 text-black font-display font-black text-xl uppercase tracking-widest hover:-translate-y-1 hover:translate-x-1 transition-all flex items-center gap-3">
                   Resume Arena <Swords className="w-6 h-6" />
                 </div>
               </div>
             </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
          {/* Feature 1 */}
          <div className="hero-card bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="w-16 h-16 bg-blue-100 border-2 border-black flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold font-display uppercase mb-4">Quest Tracking</h3>
            <p className="text-muted-foreground font-medium">
              Turn your daily study goals into quests. Earn XP for every bug fixed and concept mastered.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="hero-card bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="w-16 h-16 bg-purple-100 border-2 border-black flex items-center justify-center mb-6">
              <Swords className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold font-display uppercase mb-4">Resume Arena</h3>
            <p className="text-muted-foreground font-medium">
              Battle your resume against Job Descriptions. AI identifies your weak spots and buffs your profile.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="hero-card bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="w-16 h-16 bg-green-100 border-2 border-black flex items-center justify-center mb-6">
              <Scroll className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold font-display uppercase mb-4">Live Dashboard</h3>
            <p className="text-muted-foreground font-medium">
              Your career stats in real-time. Chat with your AI companion to update your progress instantly.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-display uppercase mb-4">How to Play</h2>
            <div className="h-2 w-24 bg-black mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Create Character", desc: "Upload your resume and set your target role to build your base stats.", icon: User },
              { step: "02", title: "Grind XP", desc: "Complete daily quests (DSA, Projects) and update your progress via chat.", icon: Gamepad2 },
              { step: "03", title: "Defeat Bosses", desc: "Use the Resume Arena to prepare for interviews and applications.", icon: Target }
            ].map((item, i) => (
              <div key={i} className="relative group">
                 <div className="absolute -inset-2 bg-black/5 transform rotate-2 group-hover:rotate-0 transition-transform"></div>
                 <div className="relative bg-white border-4 border-black p-8 h-full">
                    <span className="text-6xl font-black text-gray-100 absolute top-4 right-4 z-0">{item.step}</span>
                    <div className="relative z-10">
                       <item.icon className="w-12 h-12 mb-4" />
                       <h3 className="text-xl font-bold font-display uppercase mb-2">{item.title}</h3>
                       <p className="text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mb-20 text-center">
           <div className="bg-black text-white p-12 border-4 border-black relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black font-display uppercase mb-6">Ready to Press Start?</h2>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">Join thousands of players leveling up their careers with Version2.</p>
                <Link to="/auth">
                  <button className="bg-white text-black border-4 border-transparent hover:border-white hover:bg-black hover:text-white px-8 py-4 font-bold uppercase tracking-widest transition-all text-xl">
                    Create Free Account
                  </button>
                </Link>
              </div>
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-black bg-white py-12 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="border-4 border-black p-2 bg-primary text-white font-black text-xl">V2</div>
              <span className="font-display font-bold text-xl uppercase tracking-widest">Version2 AI</span>
            </div>
            
            <div className="flex gap-8 font-medium uppercase tracking-wide text-sm">
              <Link to="/" className="hover:underline hover:text-primary">Home</Link>
              <Link to="/app" className="hover:underline hover:text-primary">Dashboard</Link>
              <Link to="/resume-comparator" className="hover:underline hover:text-primary">Arena</Link>
            </div>
            
            <div className="text-sm font-medium text-muted-foreground">
              &copy; 2026 Version2. Game on.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;