import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { PixelBackground } from "@/components/ui/PixelBackground";
import { PixelPikachu } from "@/components/ui/PixelPikachu";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [patrolDirection, setPatrolDirection] = useState<'left' | 'right'>('right');
  const [isPeeking, setIsPeeking] = useState(false);
  const pikachuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pikachuRef.current || isLoading || isTyping) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      
      tl.set(pikachuRef.current, { x: 0, rotation: 0 });
      
      tl.call(() => {
        setPatrolDirection('right');
        setIsPeeking(false);
      })
      .to(pikachuRef.current, {
        x: 280, 
        duration: 4,
        ease: "linear",
      })
      
      .call(() => setIsPeeking(true))
      .to({}, { duration: 1.5 }) 
      
      .call(() => {
        setPatrolDirection('left');
        setIsPeeking(false);
      })
      .to(pikachuRef.current, {
        x: 0,
        duration: 4,
        ease: "linear",
      })
      
      .call(() => setIsPeeking(true));

    }, containerRef);

    return () => ctx.revert();
  }, [isLoading, isTyping]);

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800);
  };

  const getPikachuState = () => {
    if (isLoading) return "thinking";
    if (isTyping) return "typing";
    if (isPeeking) return "neutral";
    return "walking"; 
  };

  const getPikachuThought = () => {
    if (isLoading) return "Logging in...";
    if (isTyping) return "Pika pika...";
    if (isPeeking) return "Peek-a-boo!";
    return undefined;
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-50">
         <PixelBackground />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        <div className="absolute -top-24 left-8 z-20 w-full h-24 pointer-events-none">
           <div ref={pikachuRef} className="absolute left-0 top-0">
             <PixelPikachu 
                state={getPikachuState()} 
                thought={getPikachuThought()}
                direction={patrolDirection}
             />
           </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-visible mt-16">
          <div className="border-b-4 border-black bg-secondary p-6 text-center relative rounded-t-lg">
             <div className="absolute top-2 left-2 w-2 h-2 bg-black/10" />
             <div className="absolute bottom-2 right-2 w-4 h-4 bg-black/10" />
             
            <div className="mx-auto w-12 h-12 bg-primary border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded flex items-center justify-center mb-4">
              <span className="font-bold text-white font-display">V2</span>
            </div>
            <h1 className="text-2xl font-display font-bold uppercase">Welcome Player</h1>
            <p className="text-muted-foreground font-medium text-sm mt-2">
              Start your career adventure
            </p>
          </div>
          
          <div className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent gap-2">
                <TabsTrigger 
                  value="login"
                  className="border-2 border-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="border-2 border-black data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold uppercase"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="ENTER EMAIL..." 
                        type="email" 
                        className="h-12 pl-10 border-2 border-black bg-white focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); handleTyping(); }}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="PASSWORD..." 
                        type="password" 
                        className="h-12 pl-10 border-2 border-black bg-white focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); handleTyping(); }}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-black text-white hover:bg-black/90 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-display text-lg uppercase" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Start Game
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="ENTER EMAIL..." 
                        type="email" 
                        className="h-12 pl-10 border-2 border-black bg-white focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); handleTyping(); }}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="CREATE PASSWORD..." 
                        type="password" 
                        className="h-12 pl-10 border-2 border-black bg-white focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); handleTyping(); }}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary text-white hover:bg-primary/90 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-display text-lg uppercase" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                    New Game
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-black/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 border-2 border-black bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all font-bold" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Google
            </Button>
          </div>
          <div className="bg-secondary p-4 border-t-4 border-black text-center rounded-b-lg">
             <p className="text-xs text-muted-foreground font-medium">
               By clicking start, you accept our <span className="underline cursor-pointer">Rules of Play</span>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
