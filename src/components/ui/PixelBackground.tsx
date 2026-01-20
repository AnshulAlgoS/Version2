import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const PixelBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pixels = document.querySelectorAll(".pixel-particle");
      
      pixels.forEach((pixel) => {
        gsap.to(pixel, {
          y: "random(-50, 50)",
          x: "random(-50, 50)",
          rotation: "random(0, 90)",
          duration: "random(10, 20)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        
        gsap.to(pixel, {
          opacity: "random(0.1, 0.4)",
          duration: "random(3, 8)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 20 + 10,
    color: Math.random() > 0.6 ? "bg-primary" : "bg-muted-foreground",
    delay: Math.random() * 5,
  }));

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`pixel-particle absolute rounded-none opacity-20 ${p.color}`}
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
};
