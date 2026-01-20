import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { User, Gamepad2, FileText, Zap, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

const PixelNavbar = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "bounce.out",
      });
    }, navRef);
    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const NavItem = ({ to, label, icon: Icon, id, onClick }: any) => {
    if (onClick) {
      return (
        <button
          onClick={onClick}
          onMouseEnter={() => setIsHovered(id)}
          onMouseLeave={() => setIsHovered(null)}
          className="relative group px-6 py-2"
        >
          <div
            className={`absolute inset-0 border-2 border-black bg-white transition-all duration-200 ${
              isHovered === id ? "translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-yellow-300" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            }`}
          />
          <div className="relative z-10 flex items-center gap-2 font-display font-bold uppercase tracking-wide text-black">
            <Icon className={`w-4 h-4 ${isHovered === id ? "animate-bounce" : ""}`} />
            {label}
          </div>
        </button>
      );
    }
    
    return (
      <Link
        to={to}
        onMouseEnter={() => setIsHovered(id)}
        onMouseLeave={() => setIsHovered(null)}
        className="relative group px-6 py-2"
      >
        <div
          className={`absolute inset-0 border-2 border-black bg-white transition-all duration-200 ${
            isHovered === id ? "translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-yellow-300" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          }`}
        />
        <div className="relative z-10 flex items-center gap-2 font-display font-bold uppercase tracking-wide text-black">
          <Icon className={`w-4 h-4 ${isHovered === id ? "animate-bounce" : ""}`} />
          {label}
        </div>
      </Link>
    );
  };

  return (
    <nav ref={navRef} className="fixed top-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <Link to="/" className="group relative flex items-center gap-3">
           <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform" />
           
           <div className="relative border-4 border-black bg-white p-1 hover:-translate-y-1 transition-transform z-10">
              <img src="/version-logo.png" alt="Version2 Logo" className="w-16 h-16 object-contain" />
           </div>

           <div className="relative border-4 border-black bg-primary px-4 py-2 text-white font-display font-black text-2xl uppercase tracking-widest hover:-translate-y-1 transition-transform z-10 hidden md:block">
             Version2
           </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <NavItem to="/resume-comparator" label="Resume Arena" icon={FileText} id="resume" />
          <NavItem to="/app" label="Dashboard" icon={Gamepad2} id="dashboard" />
          <NavItem to="/auth" label="Login" icon={User} id="login" />
        </div>
        
        <div className="md:hidden">
            <div className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Gamepad2 className="w-6 h-6" />
            </div>
        </div>
      </div>
    </nav>
  );
};

export default PixelNavbar;
