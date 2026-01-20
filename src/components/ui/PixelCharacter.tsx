import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PixelCharacterProps {
  state?: "neutral" | "happy" | "thinking" | "typing" | "excited";
  thought?: string;
  className?: string;
}

export const PixelCharacter = ({ state = "neutral", thought, className = "" }: PixelCharacterProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const thoughtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.killTweensOf([containerRef.current, leftEyeRef.current, rightEyeRef.current, mouthRef.current]);

      if (state !== "excited") {
        gsap.to(containerRef.current, {
          y: -5,
          duration: 2,
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
        gsap.to(rightEyeRef.current, {
          scaleY: 0.2,
          duration: 0.2,
          ease: "steps(1)",
        });
        gsap.to(mouthRef.current, {
          scaleX: 1.2,
          height: "12px",
          borderRadius: "0 0 12px 12px",
          duration: 0.3,
        });

        if (state === "excited") {
          gsap.to(containerRef.current, {
            y: -15,
            duration: 0.3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
          });
        }
      } else if (state === "thinking") {
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          y: -4,
          x: 2,
          duration: 0.5,
          ease: "steps(3)",
        });
        gsap.to(mouthRef.current, {
          width: "10px",
          height: "4px",
          duration: 0.3,
        });
      } else if (state === "typing") {
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          y: 3,
          scaleY: 0.8,
          duration: 0.2
        });
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          x: 2,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "steps(3)"
        });
        gsap.to(mouthRef.current, {
            width: "15px",
            height: "3px",
            repeat: -1,
            yoyo: true,
            duration: 0.15
        });
      } else {
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          y: 0,
          x: 0,
          scaleY: 1,
          duration: 0.3,
        });
        gsap.to(mouthRef.current, {
          width: "20px",
          height: "6px",
          borderRadius: "0 0 4px 4px",
          duration: 0.3,
        });
      }

      if (thought) {
        gsap.set(thoughtRef.current, { display: "block" });
        gsap.fromTo(thoughtRef.current, 
          { scale: 0, opacity: 0, y: 10, rotate: -10 },
          { scale: 1, opacity: 1, y: 0, rotate: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
      } else {
        gsap.to(thoughtRef.current, { 
          scale: 0, 
          opacity: 0, 
          duration: 0.2, 
          onComplete: () => gsap.set(thoughtRef.current, { display: "none" }) 
        });
      }

    }, wrapperRef);

    return () => ctx.revert();
  }, [state, thought]);

  return (
    <div ref={wrapperRef} className="relative flex items-center justify-center">
      <div 
        ref={containerRef} 
        className={`relative w-24 h-24 bg-primary rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center ${className}`}
      >
        <div className="relative w-16 h-12 flex flex-col items-center justify-between py-2">
          <div className="flex justify-between w-full px-1">
            <div ref={leftEyeRef} className="w-4 h-4 bg-white border-2 border-black" />
            <div ref={rightEyeRef} className="w-4 h-4 bg-white border-2 border-black" />
          </div>
          
          <div className="absolute top-6 w-full flex justify-between px-0">
            <div className="w-3 h-1 bg-red-300 opacity-50 rounded-full" />
            <div className="w-3 h-1 bg-red-300 opacity-50 rounded-full" />
          </div>

          <div 
            ref={mouthRef} 
            className="w-5 h-1.5 bg-black mt-1"
          />
        </div>

        <div className="absolute top-1 left-1 w-2 h-2 bg-white/30" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-white/20" />
      </div>

      <div 
        ref={thoughtRef} 
        className="absolute bottom-full left-1/2 ml-4 mb-2 w-40 bg-white border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 origin-bottom-left hidden"
      >
          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b-2 border-r-2 border-black transform rotate-45" />
          <div className="absolute -bottom-4 left-2 w-2 h-2 bg-white border-2 border-black rounded-full" />
          
          <p className="font-display text-xs font-bold uppercase leading-tight text-center text-black">
            {thought}
          </p>
      </div>
    </div>
  );
};
