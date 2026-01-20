import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface ProgressRingProps {
  progress: number;
  size?: number;
}

const ProgressRing = ({ progress, size = 200 }: ProgressRingProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const animation = gsap.to(
      { value: 0 },
      {
        value: progress,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: function () {
          setAnimatedProgress(Math.round(this.targets()[0].value));
        },
      }
    );

    return () => {
      animation.kill();
    };
  }, [progress]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-glow transition-all duration-300"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl font-bold text-primary">
          {animatedProgress}%
        </span>
        <span className="text-sm text-muted-foreground">complete</span>
      </div>
    </div>
  );
};

export default ProgressRing;
