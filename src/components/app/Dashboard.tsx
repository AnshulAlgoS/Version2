import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Clock, Target, TrendingUp, Zap, Sparkles, User, BrainCircuit } from "lucide-react";
import SkillRadarChart from "./SkillRadarChart";
import ProgressRing from "./ProgressRing";
import SemesterTimeline from "./SemesterTimeline";
import CareerCalendar from "./CareerCalendar";
import type { ProgressData, TargetProfile, UserProfile, TodoItem } from "@/pages/AppPage";
import { Skeleton } from "@/components/ui/skeleton";
import { PixelBackground } from "@/components/ui/PixelBackground";
import { StudyingPikachu } from "@/components/ui/StudyingPikachu";

interface DashboardProps {
  progressData: ProgressData;
  activeTarget: TargetProfile | undefined;
  userProfile: UserProfile | null;
  calendarTodos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onAddTodo: (text: string, category?: "dsa" | "project" | "learning" | "other") => void;
}

const Dashboard = ({
  progressData,
  activeTarget,
  userProfile,
  calendarTodos,
  onToggleTodo,
  onDeleteTodo,
  onAddTodo,
}: DashboardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );

      gsap.fromTo(
        statsRef.current?.children || [],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    {
      icon: Target,
      label: "Overall Progress",
      value: `${progressData.overallProgress}%`,
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Semester Progress",
      value: `${progressData.semesterProgress}%`,
      color: "text-chart-2",
    },
    {
      icon: Zap,
      label: "Skills Completed",
      value: `${progressData.skillsCompleted}/${progressData.skillsTotal}`,
      color: "text-chart-3",
    },
    {
      icon: Clock,
      label: "ETA to Target",
      value: `${progressData.estimatedMonths} mo`,
      color: "text-chart-4",
    },
  ];

  const FormattedText = ({ text }: { text: string }) => {
    if (!text) return <span>No analysis available.</span>;
    
    return (
      <div className="space-y-2 whitespace-pre-wrap">
        {text.split('\n').map((line, i) => {
          const boldMatch = line.match(/\*\*(.*?)\*\*/);
          if (boldMatch) {
             const parts = line.split(/\*\*(.*?)\*\*/);
             return (
               <p key={i} className="text-foreground/90">
                 {parts.map((part, index) => 
                   index % 2 === 1 ? <strong key={index} className="text-foreground font-semibold">{part}</strong> : part
                 )}
               </p>
             );
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={i} className="flex gap-2 ml-2">
                <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                <span className="text-muted-foreground">{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          return <p key={i} className="text-muted-foreground">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto bg-background/50 p-8 relative">
      <PixelBackground />
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-8 flex items-center justify-between relative z-10 bg-white/80 p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-6">
            <div className="bg-yellow-100/50 p-2 rounded-lg border-2 border-black/10">
              <StudyingPikachu />
            </div>
            <div>
              <h1 className="text-4xl font-black font-display tracking-tight uppercase text-black">
                Welcome Back, <span className="text-primary">{userProfile?.name?.split(' ')[0] || "User"}</span>!
              </h1>
              <p className="text-lg text-muted-foreground font-medium mt-1 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Let's crush some bugs and master DSA today.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-bold bg-black text-white px-3 py-1 rounded-full">
              LEVEL {userProfile?.semester || 1}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
               XP: {Math.floor((progressData?.overallProgress || 0) * 100)} / 10000
            </div>
          </div>
        </div>

        {userProfile && (
          <div className="mb-8 bg-card border border-border shadow-sm rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <BrainCircuit className="h-32 w-32 text-primary" />
            </div>
            
            <div className="relative z-10">
              <h2 className="flex items-center gap-2 mb-4 font-display text-xl font-semibold">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Career Analysis
              </h2>
              
              {userProfile.isGeneratingAI ? (
                <div className="space-y-4 animate-pulse">
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-[250px] bg-muted" />
                     <Skeleton className="h-20 w-full bg-muted/50" />
                   </div>
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-[200px] bg-muted" />
                     <Skeleton className="h-20 w-full bg-muted/50" />
                   </div>
                   <p className="text-sm text-muted-foreground flex items-center gap-2">
                     <span className="animate-spin">⏳</span> Analyzing your interview answers...
                   </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                         <User className="h-4 w-4" /> Current Standing
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm leading-relaxed">
                        <FormattedText text={userProfile.currentDescription || ""} />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                         <Target className="h-4 w-4" /> Target Requirements
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border text-sm leading-relaxed">
                        <FormattedText text={userProfile.targetDescription || ""} />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {userProfile?.aspirations && userProfile.aspirations.length > 0 && (
          <div className="mb-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Target className="h-32 w-32 text-red-500" />
             </div>
             <h2 className="flex items-center gap-2 mb-4 font-display text-xl font-bold uppercase">
               <Target className="h-6 w-6 text-red-600" />
               Current Focus & Aspirations
             </h2>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {userProfile.aspirations.map((aspiration, i) => (
                 <div key={i} className="p-4 bg-red-50 border-2 border-red-100 rounded-lg relative group hover:border-red-300 transition-colors">
                   <div className="absolute top-2 right-2 text-red-200 group-hover:text-red-400 font-black text-4xl select-none pointer-events-none">
                     {i + 1}
                   </div>
                   <p className="text-sm font-medium text-red-900 relative z-10 leading-relaxed">
                     "{aspiration}"
                   </p>
                 </div>
               ))}
             </div>
          </div>
        )}

        <div ref={statsRef} className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border shadow-sm rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${stat.color}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="font-display text-2xl font-bold">
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">
              Skill Gap Analysis
            </h2>
            <SkillRadarChart data={progressData.skillGaps} />
          </div>

          <div className="glass-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">
              Overall Progress
            </h2>
            <div className="flex items-center justify-center py-8">
              <ProgressRing
                progress={progressData.overallProgress}
                size={200}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                You are{" "}
                <span className="font-semibold text-primary">
                  {progressData.overallProgress}%
                </span>{" "}
                of the way to becoming a{" "}
                <span className="font-semibold">{activeTarget?.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Semester Timeline */}
        {/* Semester Timeline */}
        <div className="mt-6 glass-card p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">
            Semester Timeline
          </h2>
          <SemesterTimeline
            currentSemester={userProfile?.semester || 1}
            progress={progressData?.semesterProgress || 0}
          />
        </div>

        <div className="mt-6">
          <h2 className="mb-4 font-display text-xl font-semibold">
            Progress Tracker
          </h2>
          <CareerCalendar
            todos={calendarTodos}
            onToggleTodo={onToggleTodo}
            onDeleteTodo={onDeleteTodo}
            onAddTodo={onAddTodo}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
