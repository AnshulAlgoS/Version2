import { CheckCircle, Circle, Clock } from "lucide-react";

interface SemesterTimelineProps {
  currentSemester: number;
  progress: number;
}

const SemesterTimeline = ({
  currentSemester,
  progress,
}: SemesterTimelineProps) => {
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const getSemesterStatus = (sem: number) => {
    if (sem < currentSemester) return "completed";
    if (sem === currentSemester) return "current";
    return "upcoming";
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-6 h-[calc(100%-48px)] w-0.5 bg-border" />

      {/* Semester items */}
      <div className="space-y-4">
        {semesters.map((sem) => {
          const status = getSemesterStatus(sem);

          return (
            <div key={sem} className="relative flex items-center gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                  status === "completed"
                    ? "bg-primary text-primary-foreground"
                    : status === "current"
                    ? "bg-primary/20 text-primary ring-2 ring-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : status === "current" ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4
                      className={`font-medium ${
                        status === "current" ? "text-primary" : ""
                      }`}
                    >
                      Semester {sem}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {status === "completed"
                        ? "Completed"
                        : status === "current"
                        ? `${progress}% complete`
                        : "Upcoming"}
                    </p>
                  </div>
                  {status === "current" && (
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary progress-glow transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SemesterTimeline;
