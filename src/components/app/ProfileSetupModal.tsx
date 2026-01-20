import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, MessageSquare } from "lucide-react";
import type { UserProfile } from "@/pages/AppPage";
import { generateQuestions } from "@/lib/ai";
import { PixelCharacter } from "@/components/ui/PixelCharacter";
import { PixelBackground } from "@/components/ui/PixelBackground";

interface ProfileSetupModalProps {
  onComplete: (profile: UserProfile) => void;
}

const popularSkills = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript", 
  "Java", "C++", "DSA", "SQL", "Git", "AWS", "Docker", 
  "System Design", "Machine Learning"
];

const ProfileSetupModal = ({ onComplete }: ProfileSetupModalProps) => {
  const [step, setStep] = useState(1);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  
  const [characterThought, setCharacterThought] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [semester, setSemester] = useState("");
  
  const [currentRole, setCurrentRole] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("What are your main responsibilities or key projects?");
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  const [targetRole, setTargetRole] = useState("");
  const [targetQuestion, setTargetQuestion] = useState("What specifically inspires you about this role?");
  const [targetAnswer, setTargetAnswer] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  
  const canProceedStep1 = name && degree && semester;
  const canProceedStep2 = currentRole.length > 0 && currentAnswer.length > 10;
  const canProceedStep3 = targetRole.length > 0 && targetAnswer.length > 10;
  const canComplete = weeklyHours && skills.length > 0;

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800);
  };

  const getCharacterState = () => {
    if (isGeneratingQuestion) return "thinking";
    if (isTyping) return "typing";
    if (step === 2 && canProceedStep2) return "excited";
    if (step === 3 && canProceedStep3) return "excited";
    if (step === 4 && skills.length > 2) return "excited";
    return "neutral";
  };

  useEffect(() => {
    let thought = "";
    if (isGeneratingQuestion) {
      thought = "Analyzing profile...";
    } else if (isTyping) {
      thought = "Taking notes...";
    } else if (getCharacterState() === "excited") {
      thought = "Level Up Ready!";
    } else {
      if (step === 1) thought = "Who are you?";
      else if (step === 2) thought = "Tell me more!";
      else if (step === 3) thought = "Dream big!";
      else if (step === 4) thought = "Equip skills!";
    }
    
    setCharacterThought(thought);

    if (!isGeneratingQuestion && !isTyping && getCharacterState() !== "excited") {
      const timer = setTimeout(() => setCharacterThought(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingQuestion, isTyping, step, canProceedStep2, canProceedStep3, skills.length]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill && !skills.includes(customSkill)) {
      setSkills((prev) => [...prev, customSkill]);
      setCustomSkill("");
    }
  };

  const handleRoleBlur = async (role: string, type: "current" | "target") => {
    if (!role) return;
    setIsGeneratingQuestion(true);
    try {
      if (type === "current") {
         const q = await generateQuestions(role);
         setCurrentQuestion(q);
      } else {
         const q = await generateQuestions(role + " (as a target goal)");
         setTargetQuestion(q);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleComplete = () => {
    onComplete({
      name,
      degree,
      semester: parseInt(semester),
      skills,
      weeklyHours: parseInt(weeklyHours),
      resumeUploaded: false,
      currentRole,
      targetRole,
      interviewAnswers: [
        { question: currentQuestion, answer: currentAnswer },
        { question: targetQuestion, answer: targetAnswer }
      ]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-sans">
      <div className="absolute inset-0 z-0 opacity-50">
         <PixelBackground />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col max-h-[90vh] rounded-xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <div className="border-b-4 border-black bg-secondary p-6 text-center relative rounded-t-lg">
           <div className="absolute top-2 left-2 w-2 h-2 bg-black/10" />
           <div className="absolute bottom-2 right-2 w-4 h-4 bg-black/10" />

          <div className="mx-auto mb-8 flex items-center justify-center gap-4">
            <PixelCharacter state={getCharacterState()} thought={characterThought} />
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase">
                {step === 1 && "Player Setup"}
                {step === 2 && "Current Level"}
                {step === 3 && "Boss Level"}
                {step === 4 && "Skill Tree"}
              </h2>
              <p className="text-muted-foreground font-medium">
                Step {step} of 4
              </p>
            </div>
          </div>

          <div className="mt-4 px-12">
            <div className="h-4 w-full border-2 border-black bg-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               <div 
                 className="h-full bg-primary transition-all duration-500 ease-out"
                 style={{ width: `${(step / 4) * 100}%` }}
               />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-lg font-bold font-display uppercase">Player Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => { setName(e.target.value); handleTyping(); }}
                    placeholder="ENTER NAME..."
                    className="h-12 border-2 border-black bg-secondary text-lg font-medium focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-muted-foreground/50"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-lg font-bold font-display uppercase">Class / Title</Label>
                    <Select value={degree} onValueChange={setDegree}>
                      <SelectTrigger className="h-12 border-2 border-black bg-white focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <SelectValue placeholder="SELECT CLASS..." />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black font-medium">
                        <SelectItem value="BTech CSE">BTech CSE</SelectItem>
                        <SelectItem value="BTech IT">BTech IT</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="Working Professional">Working Professional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg font-bold font-display uppercase">Level</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger className="h-12 border-2 border-black bg-white focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <SelectValue placeholder="SELECT LEVEL..." />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black font-medium">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            Semester {s}
                          </SelectItem>
                        ))}
                        <SelectItem value="9">Fresh Graduate</SelectItem>
                        <SelectItem value="10">Mid-Level</SelectItem>
                        <SelectItem value="11">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-lg font-bold font-display uppercase text-primary">Current Role</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentRole}
                      onChange={(e) => { setCurrentRole(e.target.value); handleTyping(); }}
                      onBlur={() => handleRoleBlur(currentRole, "current")}
                      placeholder="e.g. Student, Frontend Developer..."
                      className="h-12 border-2 border-black bg-white text-lg font-medium focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="rounded-xl border-2 border-black bg-secondary p-6 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-primary border border-black">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg font-display uppercase">NPC Interviewer</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {isGeneratingQuestion ? "Thinking..." : currentQuestion}
                      </p>
                    </div>
                  </div>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => { setCurrentAnswer(e.target.value); handleTyping(); }}
                    placeholder="Type your answer here..."
                    className="min-h-[120px] border-2 border-black bg-white text-base leading-relaxed focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-lg font-bold font-display uppercase text-blue-600">Dream Job</Label>
                  <Input
                    value={targetRole}
                    onChange={(e) => { setTargetRole(e.target.value); handleTyping(); }}
                    onBlur={() => handleRoleBlur(targetRole, "target")}
                    placeholder="e.g. Senior Software Engineer at Google"
                    className="h-12 border-2 border-black bg-white text-lg font-medium focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    autoFocus
                  />
                </div>

                <div className="rounded-xl border-2 border-black bg-blue-50 p-6 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-blue-600 border border-black">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg font-display uppercase">Career Guide</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                         {isGeneratingQuestion ? "Analyzing path..." : targetQuestion}
                      </p>
                    </div>
                  </div>
                  <Textarea
                    value={targetAnswer}
                    onChange={(e) => { setTargetAnswer(e.target.value); handleTyping(); }}
                    placeholder="I want to build scalable systems..."
                    className="min-h-[120px] border-2 border-black bg-white text-base leading-relaxed focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
               <div className="space-y-4">
                 <Label className="text-lg font-bold font-display uppercase">Acquired Skills</Label>
                 <div className="flex flex-wrap gap-2">
                   {popularSkills.map((skill) => (
                     <div
                       key={skill}
                       onClick={() => toggleSkill(skill)}
                       className={`cursor-pointer px-3 py-1.5 text-sm font-bold border-2 border-black transition-all hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                         skills.includes(skill) 
                           ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                           : "bg-white text-muted-foreground"
                       }`}
                     >
                       {skill}
                       {skills.includes(skill) && <span className="ml-1.5">✓</span>}
                     </div>
                   ))}
                 </div>
                 
                 <div className="flex gap-2 pt-2">
                    <Input
                      value={customSkill}
                      onChange={(e) => { setCustomSkill(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                      placeholder="Add another skill..."
                      className="h-10 border-2 border-black bg-white focus-visible:ring-0"
                    />
                    <Button 
                      variant="outline" 
                      onClick={addCustomSkill} 
                      className="border-2 border-black bg-secondary hover:bg-secondary/80 font-bold"
                    >
                      ADD
                    </Button>
                 </div>
               </div>

               <div className="space-y-2 pt-4">
                 <Label className="text-lg font-bold font-display uppercase">Availability</Label>
                 <Select value={weeklyHours} onValueChange={setWeeklyHours}>
                    <SelectTrigger className="h-12 border-2 border-black bg-white focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <SelectValue placeholder="HOURS PER WEEK" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black font-medium">
                      <SelectItem value="5">5 hours (Casual)</SelectItem>
                      <SelectItem value="10">10 hours (Steady)</SelectItem>
                      <SelectItem value="20">20 hours (Serious)</SelectItem>
                      <SelectItem value="40">40 hours (Hardcore)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          )}
        </div>

        <div className="border-t-4 border-black bg-secondary p-6 rounded-b-lg">
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="font-display text-xl hover:bg-transparent hover:text-primary disabled:opacity-50"
            >
              &lt; BACK
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                className="bg-black text-white border-2 border-black px-8 font-display text-xl hover:bg-primary hover:text-white hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
              >
                NEXT LEVEL &gt;
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canComplete}
                className="bg-primary text-white border-2 border-black px-8 font-display text-xl hover:bg-primary/90 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
              >
                START GAME <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
