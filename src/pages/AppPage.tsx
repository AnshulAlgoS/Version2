import { useState, useEffect } from "react";
import ChatSidebar from "@/components/app/ChatSidebar";
import Dashboard from "@/components/app/Dashboard";
import ProfileSetupModal from "@/components/app/ProfileSetupModal";
import { expandProfileWithAI } from "@/lib/ai";
import { toast } from "sonner";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export interface UserProfile {
  name: string;
  degree: string;
  semester: number;
  skills: string[];
  weeklyHours: number;
  resumeUploaded: boolean;
  currentRole?: string;
  targetRole?: string;
  currentDescription?: string;
  targetDescription?: string;
  interviewAnswers?: { question: string, answer: string }[];
  isGeneratingAI?: boolean;
  todos?: TodoItem[];
  progressData?: ProgressData;
  achievements?: string[];
  bio?: string;
  chatHistory?: { id: string; role: "user" | "assistant"; content: string; timestamp: any }[];
  comparisons?: { id: string; date: any; score: number; missingSkills: string[]; feedback: string }[];
  aspirations?: string[];
}

export interface TargetProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  skills: string[];
  isActive: boolean;
}

export interface ProgressData {
  overallProgress: number;
  semesterProgress: number;
  skillsCompleted: number;
  skillsTotal: number;
  estimatedMonths: number;
  skillGaps: Array<{ name: string; current: number; target: number }>;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  category: "dsa" | "project" | "learning" | "other";
}

const AppPage = () => {
  const [showProfileSetup, setShowProfileSetup] = useState(false); // Default to false, check DB first
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [targetProfiles, setTargetProfiles] = useState<TargetProfile[]>([]);
  
  // Lifted Calendar State
  const [calendarTodos, setCalendarTodos] = useState<TodoItem[]>([
    {
      id: "1",
      text: "Solve 3 LeetCode problems",
      completed: true,
      date: new Date(),
      category: "dsa",
    },
    {
      id: "2",
      text: "Work on portfolio project",
      completed: false,
      date: new Date(),
      category: "project",
    },
  ]);

  const [progressData, setProgressData] = useState<ProgressData>({
    overallProgress: 0,
    semesterProgress: 0, 
    skillsCompleted: 0,
    skillsTotal: 20,
    estimatedMonths: 24,
    skillGaps: [
      { name: "DSA", current: 0, target: 80 },
      { name: "System Design", current: 0, target: 75 },
      { name: "Development", current: 0, target: 85 },
      { name: "CS Fundamentals", current: 0, target: 90 },
    ],
  });

  // Fetch User Data on Mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUserProfile(data);
            
            // Load Todos if available
            if (data.todos) {
              // Convert Firestore Timestamps to Date objects
              const loadedTodos = data.todos.map((t: any) => ({
                ...t,
                date: t.date?.toDate ? t.date.toDate() : new Date(t.date),
              }));
              setCalendarTodos(loadedTodos);
            }

            // Load Progress Data if available
            if (data.progressData) {
              setProgressData(data.progressData);
            }
            
            // Reconstruct target profile
            if (data.targetRole) {
              setTargetProfiles([{
                id: "1",
                name: "Target Role", 
                title: data.targetRole,
                company: "Tech Giant",
                skills: ["React", "Node.js", "System Design"], // This should ideally be saved/loaded too
                isActive: true
              }]);
            }
          } else {
            setShowProfileSetup(true);
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          if (error.code === 'permission-denied') {
            toast.error("Database Permission Error", {
              description: "Please check your Firestore Rules in the Firebase Console."
            });
          } else {
            toast.error("Failed to load profile");
          }
        }
      } else {
        setShowProfileSetup(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProfileComplete = async (profileData: UserProfile) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to save your profile.");
      return;
    }

    // 1. Update Local State
    const initialProfile = { ...profileData, isGeneratingAI: true };
    setUserProfile(initialProfile);
    setShowProfileSetup(false);
    
    // Create a target profile based on the user's target role
    const newTarget: TargetProfile = {
      id: "1",
      name: "Target Role", 
      title: profileData.targetRole || "Software Engineer",
      company: "Tech Giant",
      skills: ["React", "Node.js", "System Design"],
      isActive: true
    };
    setTargetProfiles([newTarget]);

    // 2. Save Initial Data to Firestore
    try {
      await setDoc(doc(db, "users", user.uid), initialProfile);
      toast.success("Profile saved!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      if (error.code === 'permission-denied') {
        toast.error("Permission Denied", { description: "Check Firestore Rules in Firebase Console." });
      } else {
        toast.error("Failed to save profile to database.");
      }
    }

    try {
       // Simulate AI analysis delay (or replace with real AI call if available)
       setTimeout(async () => {
          // Call AI for Current Role
          const currentDesc = await expandProfileWithAI(
            profileData.currentRole || "Student", 
            "current",
            profileData.interviewAnswers
          );

          // Call AI for Target Role
          const targetDesc = await expandProfileWithAI(
            profileData.targetRole || "Software Engineer", 
            "target",
            profileData.interviewAnswers
          );
          
          const finalProfile = {
            ...profileData,
            currentDescription: currentDesc,
            targetDescription: targetDesc,
            isGeneratingAI: false
          };
 
          setUserProfile(finalProfile);
          
          // 3. Update Firestore with AI Expanded Data
          if (user) {
             await setDoc(doc(db, "users", user.uid), finalProfile, { merge: true });
          }
 
          toast.success("AI Analysis Complete", {
            description: "Your personalized career roadmap is ready."
          });
       }, 3000);
     } catch (error) {
      console.error("AI Error:", error);
      const errorProfile = { ...profileData, isGeneratingAI: false };
      setUserProfile(errorProfile);
      if (user) {
         await setDoc(doc(db, "users", user.uid), errorProfile, { merge: true });
      }
    }
  };

  const handleUpdateProgress = async (newData: Partial<ProgressData>) => {
    const updatedProgress = { ...progressData, ...newData };
    setProgressData(updatedProgress);
    
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { progressData: updatedProgress }, { merge: true });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  };

  const saveTodos = async (newTodos: TodoItem[]) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { todos: newTodos }, { merge: true });
      } catch (error) {
        console.error("Error saving todos:", error);
      }
    }
  };

  const handleAddTodo = (text: string, category: TodoItem["category"] = "learning") => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      date: new Date(),
      category,
    };
    const updatedTodos = [...calendarTodos, newTodo];
    setCalendarTodos(updatedTodos);
    saveTodos(updatedTodos);
    toast.success("Task Added", { description: `Added "${text}" to your calendar.` });
  };

  const handleToggleTodo = (id: string) => {
    const updatedTodos = calendarTodos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setCalendarTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = calendarTodos.filter(t => t.id !== id);
    setCalendarTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...userProfile, ...updates } as UserProfile;
    setUserProfile(updatedProfile);

    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
        toast.success("Profile updated");
      } catch (error) {
        console.error("Error saving profile updates:", error);
      }
    }
  };

  const activeTarget = targetProfiles.find((t) => t.isActive);

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetupModal onComplete={handleProfileComplete} />
      )}

      {/* Chat Sidebar */}
      <ChatSidebar
        userProfile={userProfile}
        activeTarget={activeTarget}
        onProfileEdit={() => setShowProfileSetup(true)}
        onUpdateProgress={handleUpdateProgress}
        onAddTodo={handleAddTodo}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Dashboard */}
      <Dashboard
        progressData={progressData}
        activeTarget={activeTarget}
        userProfile={userProfile}
        calendarTodos={calendarTodos}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
        onAddTodo={handleAddTodo}
      />
    </div>
  );
};

export default AppPage;
