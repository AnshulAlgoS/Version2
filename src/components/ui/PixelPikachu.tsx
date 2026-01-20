import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PixelPikachuProps {
  state?: "neutral" | "happy" | "thinking" | "typing" | "excited" | "walking";
  direction?: "left" | "right";
  thought?: string;
  className?: string;
  scale?: number;
}

export const PixelPikachu = ({ state = "neutral", direction = "right", thought, className = "", scale = 1 }: PixelPikachuProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const leftEarRef = useRef<HTMLDivElement>(null);
  const rightEarRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const leftArmRef = useRef<HTMLDivElement>(null);
  const rightArmRef = useRef<HTMLDivElement>(null);
  const thoughtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, {
        scaleX: direction === "right" ? scale : -scale,
        scaleY: scale,
        duration: 0.3,
        ease: "back.out(1.5)"
      });
      
      if (thoughtRef.current) {
        gsap.to(thoughtRef.current, {
          scaleX: direction === "right" ? 1 : -1,
          x: direction === "right" ? 0 : -100,
          duration: 0
        });
      }
    }
  }, [direction, scale]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.killTweensOf([
        containerRef.current, 
        headRef.current,
        leftEyeRef.current, 
        rightEyeRef.current, 
        mouthRef.current, 
        leftEarRef.current, 
        rightEarRef.current,
        tailRef.current,
        leftArmRef.current,
        rightArmRef.current
      ]);

      if (state !== "excited" && state !== "walking") {
        gsap.to(containerRef.current, {
          y: -4,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        
        gsap.to(headRef.current, {
          y: 2,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.1
        });

        gsap.to([leftEarRef.current, rightEarRef.current], {
          rotate: 5,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(tailRef.current, {
          rotate: 10,
          transformOrigin: "bottom left",
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      const blink = () => {
        if (state === "happy" || state === "excited") return; 
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: Math.random() * 3 + 2,
        });
        tl.to([leftEyeRef.current, rightEyeRef.current], {
          scaleY: 0.1,
          duration: 0.1,
          ease: "steps(1)",
        }).to([leftEyeRef.current, rightEyeRef.current], {
          scaleY: 1,
          duration: 0.1,
          ease: "steps(1)",
        });
      };
      blink();

      if (state === "happy" || state === "excited") {
        gsap.to(rightEyeRef.current, { scaleY: 0.2, duration: 0.2, ease: "steps(1)" });
        gsap.to(mouthRef.current, {
          scaleX: 1.2,
          height: "14px",
          borderRadius: "0 0 14px 14px",
          duration: 0.3,
        });
        gsap.to([leftArmRef.current, rightArmRef.current], { y: -5, rotate: -20, duration: 0.3 });

        if (state === "excited") {
          gsap.to(containerRef.current, {
            y: -25,
            duration: 0.4,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
          });
          gsap.to([leftEarRef.current, rightEarRef.current], { rotate: 20, duration: 0.2 });
          gsap.to(tailRef.current, { rotate: 20, duration: 0.2, repeat: -1, yoyo: true });
        }
      } else if (state === "thinking") {
        gsap.to([leftEyeRef.current, rightEyeRef.current], { y: -4, x: 2, duration: 0.5, ease: "steps(3)" });
        gsap.to(leftEarRef.current, { rotate: -25, duration: 0.5 });
        gsap.to(tailRef.current, { rotate: -10, duration: 1 });
        gsap.to(rightArmRef.current, { y: -8, x: -5, rotate: -45, duration: 0.5 });
      } else if (state === "typing") {
        gsap.to([leftEyeRef.current, rightEyeRef.current], { y: 3, scaleY: 0.8, duration: 0.2 });
        gsap.to([leftEyeRef.current, rightEyeRef.current], { x: 2, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(3)" });
        gsap.to(leftArmRef.current, { y: 4, duration: 0.1, repeat: -1, yoyo: true });
        gsap.to(rightArmRef.current, { y: 4, duration: 0.1, repeat: -1, yoyo: true, delay: 0.05 });
      } else if (state === "walking") {
        gsap.to(containerRef.current, {
          y: -5,
          duration: 0.15,
          repeat: -1,
          yoyo: true,
          ease: "power1.out"
        });
        
        gsap.to(leftArmRef.current, { rotate: 45, duration: 0.3, repeat: -1, yoyo: true });
        gsap.to(rightArmRef.current, { rotate: -45, duration: 0.3, repeat: -1, yoyo: true });
        
        gsap.to([leftEarRef.current, rightEarRef.current], { rotate: -5, duration: 0.15, repeat: -1, yoyo: true });
        
        gsap.to(tailRef.current, { rotate: 15, duration: 0.3, repeat: -1, yoyo: true });
      }

      if (thought) {
        gsap.set(thoughtRef.current, { display: "block" });
        gsap.fromTo(thoughtRef.current, 
          { scale: 0, opacity: 0, y: 10, rotate: -10 },
          { scale: 1, opacity: 1, y: 0, rotate: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
      } else {
        gsap.to(thoughtRef.current, { 
          scale: 0, opacity: 0, duration: 0.2, 
          onComplete: () => gsap.set(thoughtRef.current, { display: "none" }) 
        });
      }

    }, wrapperRef);

    return () => ctx.revert();
  }, [state, thought]);

  return (
    <div ref={wrapperRef} className={`relative flex items-center justify-center z-20 ${className}`}>
      <div ref={containerRef} className="relative flex flex-col items-center">
        
        <div ref={tailRef} className="absolute bottom-4 left-10 w-24 h-24 z-[-1] origin-bottom-left">
           <div className="absolute bottom-0 left-0 w-4 h-12 bg-yellow-800 border-4 border-black origin-bottom-left transform -rotate-12" />
           <div className="absolute bottom-10 left-2 w-8 h-16 bg-yellow-400 border-4 border-black border-b-0 transform rotate-12" />
           <div className="absolute bottom-24 left-8 w-10 h-16 bg-yellow-400 border-4 border-black border-b-0 transform -rotate-12" />
           <div className="absolute bottom-11 left-3 w-6 h-4 bg-yellow-400 transform rotate-12 z-10" />
           <div className="absolute bottom-24 left-9 w-8 h-4 bg-yellow-400 transform -rotate-12 z-10" />
        </div>

        <div ref={headRef} className="relative w-36 h-28 z-20">
           <div ref={leftEarRef} className="absolute -top-12 -left-4 w-10 h-20 bg-yellow-400 border-4 border-black rounded-tl-full rounded-tr-3xl origin-bottom-right transform -rotate-[25deg] overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-8 bg-black transform -skew-y-12 scale-110" />
           </div>
           <div ref={rightEarRef} className="absolute -top-12 -right-4 w-10 h-20 bg-yellow-400 border-4 border-black rounded-tr-full rounded-tl-3xl origin-bottom-left transform rotate-[25deg] overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-8 bg-black transform skew-y-12 scale-110" />
           </div>

           <div className="absolute inset-0 bg-yellow-400 border-4 border-black rounded-[2rem] shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.1)]">
              <div className="relative w-full h-full flex flex-col items-center justify-center pt-6">
                
                <div className="flex justify-between w-24 px-1 mb-1">
                   <div ref={leftEyeRef} className="relative w-7 h-7 bg-black rounded-full">
                     <div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white rounded-full" />
                   </div>
                   <div ref={rightEyeRef} className="relative w-7 h-7 bg-black rounded-full">
                     <div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white rounded-full" />
                   </div>
                </div>

                <div className="w-1.5 h-1 bg-black rounded-full mb-1 opacity-80" />

                <div ref={mouthRef} className="w-5 h-2 border-b-[3px] border-black rounded-full" />
                
                <div className="absolute bottom-4 left-1 w-8 h-8 bg-red-500 rounded-full border-2 border-black/10 opacity-90" />
                <div className="absolute bottom-4 right-1 w-8 h-8 bg-red-500 rounded-full border-2 border-black/10 opacity-90" />
              </div>
           </div>
        </div>

        <div className="relative w-28 h-20 -mt-6 z-10">
           <div className="w-full h-full bg-yellow-400 border-4 border-black rounded-[2rem] rounded-t-lg relative shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.1)]">
              <div ref={leftArmRef} className="absolute top-6 -left-3 w-8 h-10 bg-yellow-400 border-4 border-black rounded-full origin-top-right transform rotate-12 z-20" />
              <div ref={rightArmRef} className="absolute top-6 -right-3 w-8 h-10 bg-yellow-400 border-4 border-black rounded-full origin-top-left transform -rotate-12 z-20" />

              <div className="absolute -bottom-3 left-4 w-8 h-5 bg-yellow-400 border-4 border-black rounded-full z-0" />
              <div className="absolute -bottom-3 right-4 w-8 h-5 bg-yellow-400 border-4 border-black rounded-full z-0" />
           </div>
        </div>

      </div>

      <div 
        ref={thoughtRef} 
        className="absolute bottom-full left-1/2 ml-12 mb-12 w-48 bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-30 origin-bottom-left hidden"
      >
          <div className="absolute -bottom-3 left-6 w-5 h-5 bg-white border-b-4 border-r-4 border-black transform rotate-45" />
          <p className="font-display text-sm font-bold uppercase leading-tight text-center text-black">
            {thought}
          </p>
      </div>
    </div>
  );
};
