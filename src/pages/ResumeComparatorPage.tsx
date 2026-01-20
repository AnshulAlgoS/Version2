import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import PixelNavbar from "@/components/layout/PixelNavbar";
import { PixelBackground } from "@/components/ui/PixelBackground";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Swords, Loader2, CheckCircle2, AlertCircle, FileText, Upload } from "lucide-react";
import { compareResumeWithJD } from "@/lib/ai";
import * as pdfjsLib from "pdfjs-dist";
// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ComparisonResult {
  score: number;
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  verdict: string;
  detailedAnalysis?: string;
}

interface UserProfile {
  bio?: string;
  achievements?: string[];
  skills?: string[];
  currentRole?: string;
  interviewAnswers?: { question: string; answer: string }[];
}

const ResumeComparatorPage = () => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [targetResumeText, setTargetResumeText] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [isReadingTargetPdf, setIsReadingTargetPdf] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [userContext, setUserContext] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "pdf">("text");
  const [activeTabTarget, setActiveTabTarget] = useState<"text" | "pdf">("text");

  useEffect(() => {
    const fetchUserContext = async () => {
       const user = auth.currentUser;
       if (user) {
         try {
           const docRef = doc(db, "users", user.uid);
           const snapshot = await getDoc(docRef);
           if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              const context = `
              Bio: ${data.bio || "N/A"}
              Achievements: ${data.achievements?.join(", ") || "N/A"}
              Skills: ${data.skills?.join(", ") || "N/A"}
              Current Role: ${data.currentRole || "N/A"}
              Interview Answers: ${data.interviewAnswers?.map((a) => `Q: ${a.question} A: ${a.answer}`).join("; ") || "N/A"}
              `;
              setUserContext(context);
           }
         } catch (error) {
           console.error("Error fetching user context:", error);
         }
       }
    };
    fetchUserContext();
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setIsReadingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => (item as { str: string }).str).join(" ");
        fullText += pageText + "\n";
      }

      setResumeText(fullText);
      toast.success("PDF loaded successfully!");
    } catch (error) {
      console.error("Error reading PDF:", error);
      toast.error("Failed to read PDF. Please try pasting the text instead.");
    } finally {
      setIsReadingPdf(false);
    }
  };

  const handleTargetPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setIsReadingTargetPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => (item as { str: string }).str).join(" ");
        fullText += pageText + "\n";
      }

      setTargetResumeText(fullText);
      toast.success("Target PDF loaded successfully!");
    } catch (error) {
      console.error("Error reading PDF:", error);
      toast.error("Failed to read PDF. Please try pasting the text instead.");
    } finally {
      setIsReadingTargetPdf(false);
    }
  };

  const handleCompare = async () => {
    if (!resumeText.trim() || !targetResumeText.trim()) {
      toast.error("Please provide both your Resume and the Target Resume.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await compareResumeWithJD(resumeText, targetResumeText, userContext, customPrompt);
      setResult(analysis);

      const user = auth.currentUser;
      if (user) {
        const comparisonRecord = {
          id: Date.now().toString(),
          date: new Date(),
          role: "Target Role", 
          company: "Target Company", 
          score: analysis.score,
          missingSkills: analysis.missingSkills,
          feedback: analysis.verdict
        };

        const updates: any = {
          comparisons: arrayUnion(comparisonRecord)
        };

        if (customPrompt.trim()) {
           updates.aspirations = arrayUnion(customPrompt.trim());
        }

        await updateDoc(doc(db, "users", user.uid), updates);
        toast.success("Analysis saved to your profile!");
      } else {
        toast.info("Login to save your analysis history.");
      }

    } catch (error: unknown) {
      console.error("Comparison failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Please check your API key and connection.";
      toast.error("Analysis Failed", {
        description: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background font-sans overflow-x-hidden">
      <PixelBackground />
      <PixelNavbar />

      <main className="relative z-10 pt-32 pb-20 px-6 container mx-auto max-w-5xl">
        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-6xl font-black font-display uppercase leading-tight mb-4 drop-shadow-sm">
             Resume <span className="text-primary">Arena</span>
           </h1>
           <p className="text-xl text-muted-foreground font-medium">
             Test your might. Upload your resume and the target resume to see the gaps.
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <h2 className="text-xl font-bold font-display uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 border-2 border-black flex items-center justify-center text-blue-600 rounded">1</span>
              Your Resume
            </h2>
            
            <div className="flex gap-2 mb-4">
               <Button 
                  size="sm"
                  variant={activeTab === "text" ? "default" : "outline"} 
                  onClick={() => setActiveTab("text")}
                  className={activeTab === "text" ? "bg-black text-white" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" /> Paste Text
               </Button>
               <Button 
                  size="sm"
                  variant={activeTab === "pdf" ? "default" : "outline"} 
                  onClick={() => setActiveTab("pdf")}
                  className={activeTab === "pdf" ? "bg-black text-white" : ""}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload PDF
               </Button>
            </div>

            {activeTab === "text" ? (
              <Textarea 
                placeholder="Paste your resume text here..."
                className="flex-grow min-h-[300px] border-2 border-black resize-none text-base p-4 focus-visible:ring-0"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            ) : (
              <div className="flex-grow min-h-[300px] border-2 border-black border-dashed flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                 {isReadingPdf ? (
                    <div className="flex flex-col items-center">
                       <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                       <p className="font-bold">Reading PDF...</p>
                    </div>
                 ) : (
                    <>
                       <Upload className="w-12 h-12 text-gray-400 mb-4" />
                       <p className="font-bold text-lg mb-2">Upload your Resume PDF</p>
                       <p className="text-sm text-muted-foreground mb-4">We will extract the text automatically.</p>
                       <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handlePdfUpload}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                          "
                        />
                        {resumeText && (
                           <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Resume loaded! ({resumeText.length} chars)
                           </div>
                        )}
                    </>
                 )}
              </div>
            )}
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <h2 className="text-xl font-bold font-display uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-100 border-2 border-black flex items-center justify-center text-red-600 rounded">2</span>
              Target Resume / Role Model
            </h2>

            <div className="flex gap-2 mb-4">
               <Button 
                  size="sm"
                  variant={activeTabTarget === "text" ? "default" : "outline"} 
                  onClick={() => setActiveTabTarget("text")}
                  className={activeTabTarget === "text" ? "bg-black text-white" : ""}
                >
                  <FileText className="w-4 h-4 mr-2" /> Paste Text
               </Button>
               <Button 
                  size="sm"
                  variant={activeTabTarget === "pdf" ? "default" : "outline"} 
                  onClick={() => setActiveTabTarget("pdf")}
                  className={activeTabTarget === "pdf" ? "bg-black text-white" : ""}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload PDF
               </Button>
            </div>

            {activeTabTarget === "text" ? (
              <Textarea 
                placeholder="Paste the target resume or job description here..."
                className="flex-grow min-h-[200px] border-2 border-black resize-none text-base p-4 focus-visible:ring-0 mb-4"
                value={targetResumeText}
                onChange={(e) => setTargetResumeText(e.target.value)}
              />
            ) : (
              <div className="flex-grow min-h-[200px] border-2 border-black border-dashed flex flex-col items-center justify-center bg-gray-50 p-6 text-center mb-4">
                 {isReadingTargetPdf ? (
                    <div className="flex flex-col items-center">
                       <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-2" />
                       <p className="font-bold">Reading Target PDF...</p>
                    </div>
                 ) : (
                    <>
                       <Upload className="w-12 h-12 text-gray-400 mb-4" />
                       <p className="font-bold text-lg mb-2">Upload Target Resume PDF</p>
                       <p className="text-sm text-muted-foreground mb-4">We will extract the text automatically.</p>
                       <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleTargetPdfUpload}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100
                          "
                        />
                        {targetResumeText && (
                           <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Target loaded! ({targetResumeText.length} chars)
                           </div>
                        )}
                    </>
                 )}
              </div>
            )}
            
            <div className="mt-auto">
               <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">Special Instructions (Optional)</h3>
               <Textarea 
                  placeholder="E.g., 'Focus on my leadership skills' or 'Ignore the degree requirement'..."
                  className="min-h-[80px] border-2 border-black resize-none text-sm p-3 focus-visible:ring-0"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
               />
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <Button 
            onClick={handleCompare} 
            disabled={isAnalyzing}
            className="h-16 px-10 text-xl font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all bg-yellow-400 text-black hover:bg-yellow-500"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Swords className="mr-3 h-6 w-6" /> Fight!
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Gaming "Monitor" Frame */}
            <div className="bg-zinc-900 border-4 border-zinc-800 p-1 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
               
               {/* Scanline Effect Overlay */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20" />
               <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-20 pointer-events-none opacity-10" />

               <div className="bg-zinc-950 border-2 border-zinc-800 p-8 relative overflow-hidden text-green-400 font-mono">
                  
                  {/* Header Bar */}
                  <div className="flex items-center justify-between border-b-2 border-green-900/50 pb-4 mb-8">
                     <h2 className="text-3xl font-black uppercase tracking-widest text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] font-display">
                        <Swords className="inline-block mr-3 w-8 h-8 animate-pulse" /> 
                        Mission Report
                     </h2>
                     <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                        <span>SYS.VER.2.0</span>
                        <span>TARGET_LOCKED</span>
                        <span className="text-green-500 animate-pulse">● LIVE</span>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-12 items-start">
                     
                     {/* Left Column: Stats & Score */}
                     <div className="flex-shrink-0 text-center mx-auto md:mx-0 w-full md:w-64">
                       <div className="relative inline-flex items-center justify-center mb-6">
                         {/* SVG Gauge */}
                         <svg className="w-56 h-56 transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                           <circle cx="112" cy="112" r="100" stroke="#1f2937" strokeWidth="16" fill="transparent" />
                           <circle 
                              cx="112" cy="112" r="100" 
                              stroke={result.score > 85 ? "#22c55e" : result.score > 50 ? "#eab308" : "#ef4444"} 
                              strokeWidth="16" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 100} 
                              strokeDashoffset={2 * Math.PI * 100 * (1 - result.score / 100)} 
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out" 
                           />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className={`text-6xl font-black font-display tracking-tighter ${result.score > 85 ? "text-green-400" : result.score > 50 ? "text-yellow-400" : "text-red-500"}`}>
                              {result.score}
                           </span>
                           <span className="text-xs font-bold uppercase text-zinc-500 tracking-[0.2em] mt-1">Power Level</span>
                         </div>
                       </div>
                       
                       <div className={`p-4 border-2 ${result.score > 85 ? "border-green-500/50 bg-green-500/10" : result.score > 50 ? "border-yellow-500/50 bg-yellow-500/10" : "border-red-500/50 bg-red-500/10"} rounded backdrop-blur-sm`}>
                          <div className="font-bold text-xl uppercase tracking-tight mb-1 font-display">{result.verdict}</div>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                             <div className={`h-full ${result.score > 85 ? "bg-green-500" : result.score > 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${result.score}%` }} />
                          </div>
                       </div>
                     </div>

                     {/* Right Column: Detailed Data */}
                     <div className="flex-grow w-full space-y-10">
                       
                       {/* Main Analysis Text */}
                       {result.detailedAnalysis && (
                         <div className="group">
                           <h3 className="text-xl font-bold font-display uppercase mb-4 flex items-center text-blue-400 border-b border-blue-900/30 pb-2">
                             <FileText className="w-5 h-5 mr-3" /> Tactical Analysis
                           </h3>
                           <div className="p-6 bg-blue-950/20 border border-blue-900/50 rounded text-sm md:text-base leading-relaxed whitespace-pre-wrap text-blue-100 font-mono shadow-[inset_0_0_20px_rgba(30,58,138,0.2)]">
                             {result.detailedAnalysis}
                           </div>
                         </div>
                       )}

                       {/* Missing Skills (Debuffs) */}
                       <div>
                         <h3 className="text-xl font-bold font-display uppercase mb-4 flex items-center text-red-500 border-b border-red-900/30 pb-2">
                           <AlertCircle className="w-5 h-5 mr-3" /> Critical Debuffs (Missing)
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {result.missingSkills.length > 0 ? (
                             result.missingSkills.map((skill, i) => (
                               <div key={i} className="flex items-center p-3 bg-red-950/30 border border-red-900/50 rounded hover:bg-red-900/20 transition-colors">
                                 <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                                 <span className="text-red-200 font-bold text-sm">{skill}</span>
                               </div>
                             ))
                           ) : (
                             <span className="text-green-500 italic">No debuffs detected. Build is optimized.</span>
                           )}
                         </div>
                       </div>

                       {/* Recommended Actions (Quests) */}
                       <div>
                          <h3 className="text-xl font-bold font-display uppercase mb-4 flex items-center text-yellow-400 border-b border-yellow-900/30 pb-2">
                           <CheckCircle2 className="w-5 h-5 mr-3" /> Skill Tree Upgrades
                         </h3>
                         <ul className="space-y-4">
                           {result.improvements.map((item, i) => (
                             <li key={i} className="flex items-start gap-4 p-4 bg-yellow-950/20 border border-yellow-900/50 rounded hover:border-yellow-500/50 transition-all group">
                               <div className="mt-1 w-6 h-6 flex items-center justify-center bg-yellow-500/20 text-yellow-500 font-bold text-xs border border-yellow-500/50 rounded-sm group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                                 {i + 1}
                               </div>
                               <span className="text-yellow-100 text-sm md:text-base font-medium leading-relaxed">{item}</span>
                             </li>
                           ))}
                         </ul>
                       </div>

                     </div>
                  </div>
               </div>
            </div>
            
            <div className="text-center mt-8">
               <p className="text-muted-foreground mb-4 font-mono text-xs uppercase tracking-widest">&gt;&gt; Data saved to local memory &lt;&lt;</p>
               <Button onClick={() => navigate('/app')} variant="outline" className="border-2 border-black font-bold hover:bg-black hover:text-white transition-all uppercase font-display tracking-widest">
                 Return to Base
               </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ResumeComparatorPage;
