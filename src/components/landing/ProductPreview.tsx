import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ProductPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mockRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="border-t border-border py-20">
      <div className="container mx-auto">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Dashboard</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Your progress, visualized</h2>
          <p className="mt-2 text-muted-foreground">
            A real-time view of your career trajectory
          </p>
        </div>

        {/* Dashboard Mock */}
        <div
          ref={mockRef}
          className="mx-auto mt-12 max-w-4xl rounded-lg border border-border bg-card p-1"
          style={{ opacity: 0 }}
        >
          {/* Browser Chrome */}
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
            <div className="h-2.5 w-2.5 rounded-full bg-muted" />
          </div>

          {/* Dashboard Content */}
          <div className="grid gap-4 p-4 md:grid-cols-3">
            {/* Progress Card */}
            <div className="rounded-md border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <p className="mt-1 font-display text-2xl font-semibold">33%</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted">
                <div className="h-full w-1/3 rounded-full bg-primary" />
              </div>
            </div>

            {/* Semester Card */}
            <div className="rounded-md border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Current Semester</p>
              <p className="mt-1 font-display text-2xl font-semibold">4th</p>
              <p className="mt-3 text-xs text-muted-foreground">2 of 8 completed</p>
            </div>

            {/* ETA Card */}
            <div className="rounded-md border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Time to Target</p>
              <p className="mt-1 font-display text-2xl font-semibold">14 mo</p>
              <p className="mt-3 text-xs text-muted-foreground">At current pace</p>
            </div>

            {/* Skill Chart Placeholder */}
            <div className="col-span-full rounded-md border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Skill Radar</p>
              <div className="mt-4 flex items-center justify-center">
                <div className="relative h-40 w-40">
                  {/* Simple radar visualization */}
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    {/* Background rings */}
                    {[20, 40, 60, 80, 100].map((r) => (
                      <circle
                        key={r}
                        cx="50"
                        cy="50"
                        r={r / 2.5}
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="0.5"
                      />
                    ))}
                    {/* Data polygon */}
                    <polygon
                      points="50,20 70,35 65,60 35,60 30,35"
                      fill="hsl(var(--primary) / 0.2)"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                <span>DSA</span>
                <span>System Design</span>
                <span>Cloud</span>
                <span>Leadership</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPreview;