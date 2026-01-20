import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (stepsRef.current) {
        gsap.fromTo(
          stepsRef.current.children,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      step: "01",
      title: "Upload your resume",
      description: "Drop your current resume. We extract skills, projects, and experience.",
    },
    {
      step: "02",
      title: "Choose your target",
      description: "Upload a resume of someone you admire or a job role you want.",
    },
    {
      step: "03",
      title: "Track progress",
      description: "Get a roadmap with time estimates and track your growth semester-wise.",
    },
  ];

  return (
    <section ref={sectionRef} id="how-it-works" className="border-t border-border py-20">
      <div className="container mx-auto">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Process</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">How it works</h2>
        </div>

        <div
          ref={stepsRef}
          className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-3"
        >
          {steps.map((item) => (
            <div key={item.step} className="text-left">
              <span className="font-display text-sm font-semibold text-primary">{item.step}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;