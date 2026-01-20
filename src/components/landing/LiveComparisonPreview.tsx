import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const LiveComparisonPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const skills = [
    { name: "System Design", current: 35, target: 90 },
    { name: "Data Structures", current: 60, target: 95 },
    { name: "Cloud Architecture", current: 20, target: 85 },
    { name: "Leadership", current: 15, target: 70 },
  ];

  return (
    <section ref={sectionRef} className="border-t border-border py-20">
      <div className="container mx-auto">
        <div ref={contentRef} className="mx-auto max-w-2xl" style={{ opacity: 0 }}>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Live Preview</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Your Career Distance</h2>
            <p className="mt-2 text-muted-foreground">
              Example output from a resume comparison
            </p>
          </div>

          <div className="mt-10 rounded-lg border border-border bg-card p-6">
            {/* Distance Score */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm text-muted-foreground">Distance to Target</p>
                <p className="font-display text-2xl font-semibold text-primary">67%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="font-display text-2xl font-semibold">14-18 months</p>
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="mt-6 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Skill Gap Analysis
              </p>
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{skill.name}</span>
                    <span className="text-muted-foreground">
                      {skill.current}% → {skill.target}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${(skill.current / skill.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveComparisonPreview;