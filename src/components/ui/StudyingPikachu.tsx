import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const StudyingPikachu = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Head Bobbing (Reading Rhythm)
      gsap.to(".pikachu-head", {
        y: 1,
        rotation: 1,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 2. Tail Wagging
      gsap.to(".pikachu-tail", {
        rotation: 10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "bottom left",
      });

      // 3. Blinking
      const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: 3.5 });
      blinkTl
        .to(".eye-open", { opacity: 0, duration: 0.1 })
        .to(".eye-closed", { opacity: 1, duration: 0 })
        .to({}, { duration: 0.15 })
        .to(".eye-closed", { opacity: 0, duration: 0 })
        .to(".eye-open", { opacity: 1, duration: 0.1 });

      // 4. Steam from Coffee
      gsap.to(".steam-particle", {
        y: -15,
        opacity: 0,
        duration: 2,
        stagger: 0.5,
        repeat: -1,
        ease: "power1.out",
      });

      // 5. Floating Notes (Studying intensity)
      gsap.to(".float-note", {
        y: -20,
        x: "random(-10, 10)",
        rotation: "random(-20, 20)",
        opacity: 0,
        duration: 2.5,
        stagger: 1,
        repeat: -1,
        ease: "power1.out",
      });
      
      // 6. Pen Writing Motion
      gsap.to(".pen-hand", {
        x: 2,
        y: 1,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const s = 4; 

  return (
    <div ref={containerRef} className="relative w-[160px] h-[140px] flex items-center justify-center select-none overflow-visible">
      
      <div className="absolute top-0 right-4 z-20 flex flex-col pointer-events-none">
        <div className="float-note text-xs font-bold text-blue-500 absolute top-4 right-0">DSA</div>
        <div className="float-note text-xs font-bold text-green-500 absolute top-8 -right-4">O(n)</div>
        <div className="float-note text-xs font-bold text-purple-500 absolute top-0 -right-2">Bug?</div>
      </div>

      <svg width={160} height={140} viewBox="0 0 40 35" className="drop-shadow-xl">
        <defs>
          <filter id="pixelate" x="0" y="0">
            <feFlood x="2" y="2" height="1" width="1"/>
            <feComposite width="4" height="4"/>
            <feTile result="a"/>
            <feComposite in="SourceGraphic" in2="a" operator="in"/>
            <feMorphology operator="dilate" radius="0.5"/>
          </filter>
        </defs>

        <rect x="2" y="28" width="36" height="7" fill="#8B4513" rx="1" />
        <rect x="4" y="29" width="32" height="1" fill="#A0522D" />

        <g className="pikachu-body" transform="translate(0, 2)">
          <path className="pikachu-tail" d="M10,20 L6,18 L8,14 L5,12 L8,8 L12,10" stroke="#FACC15" strokeWidth="3" fill="none" strokeLinejoin="round" />
          
          <rect x="14" y="16" width="12" height="13" rx="4" fill="#FACC15" />
          
          <g className="pikachu-head" transformOrigin="20 16">
            <rect x="13" y="8" width="14" height="11" rx="3" fill="#FACC15" />
            
            <path d="M14,9 L10,3 L13,5 Z" fill="#FACC15" />
            <path d="M10,3 L11,5 L13,5 Z" fill="#000000" />
            <path d="M26,9 L30,3 L27,5 Z" fill="#FACC15" />
            <path d="M30,3 L29,5 L27,5 Z" fill="#000000" />

            <g transform="translate(0, 1)">
               <circle cx="17" cy="13" r="2.5" fill="none" stroke="#000000" strokeWidth="0.5" />
               <circle cx="23" cy="13" r="2.5" fill="none" stroke="#000000" strokeWidth="0.5" />
               <line x1="19.5" y1="13" x2="20.5" y2="13" stroke="#000000" strokeWidth="0.5" />
               <line x1="14.5" y1="13" x2="13" y2="12" stroke="#000000" strokeWidth="0.5" />
               <line x1="25.5" y1="13" x2="27" y2="12" stroke="#000000" strokeWidth="0.5" />
            </g>

            <g className="eye-open">
               <circle cx="17" cy="13" r="1" fill="#000000" />
               <circle cx="23" cy="13" r="1" fill="#000000" />
               <circle cx="17.3" cy="12.7" r="0.3" fill="#FFFFFF" />
               <circle cx="23.3" cy="12.7" r="0.3" fill="#FFFFFF" />
            </g>
            <g className="eye-closed" opacity="0">
               <line x1="16" y1="13" x2="18" y2="13" stroke="#000000" strokeWidth="0.5" />
               <line x1="22" y1="13" x2="24" y2="13" stroke="#000000" strokeWidth="0.5" />
            </g>

            <circle cx="15" cy="15" r="1" fill="#EF4444" opacity="0.6" />
            <circle cx="25" cy="15" r="1" fill="#EF4444" opacity="0.6" />
            <path d="M19,15 Q20,15.5 21,15" fill="none" stroke="#000000" strokeWidth="0.5" />
          </g>

          <circle cx="15" cy="22" r="2" fill="#FACC15" />
          <g className="pen-hand">
             <circle cx="25" cy="24" r="2" fill="#FACC15" />
             <line x1="25" y1="24" x2="25" y2="28" stroke="#3B82F6" strokeWidth="1" />
          </g>
        </g>

        <path d="M14,28 L26,28 L26,26 Q20,27 14,26 Z" fill="#F3F4F6" />
        <path d="M14,28 L14,26 L26,26 L26,28 Z" fill="#1E3A8A" />
        
        <rect x="4" y="24" width="8" height="2" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.5" />
        <rect x="5" y="22" width="7" height="2" fill="#10B981" stroke="#065F46" strokeWidth="0.5" />
        <rect x="6" y="20" width="6" height="2" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.5" />

        <rect x="32" y="24" width="4" height="4" rx="0.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5" />
        <path d="M36,25 Q37,25 37,26 Q37,27 36,27" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
        
        <g className="steam-group" transform="translate(34, 22)">
           <circle className="steam-particle" cx="0" cy="0" r="0.5" fill="#FFFFFF" opacity="0.6" />
           <circle className="steam-particle" cx="1" cy="1" r="0.5" fill="#FFFFFF" opacity="0.6" />
           <circle className="steam-particle" cx="-0.5" cy="1.5" r="0.5" fill="#FFFFFF" opacity="0.6" />
        </g>

      </svg>
    </div>
  );
};
