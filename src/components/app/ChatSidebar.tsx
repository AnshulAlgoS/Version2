import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processUserChat } from "@/lib/ai";
import {
  Send,
  Upload,
  User,
  Target,
  Settings,
  Sparkles,
} from "lucide-react";
import type { UserProfile, TargetProfile, ProgressData, TodoItem } from "@/pages/AppPage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  userProfile: UserProfile | null;
  activeTarget: TargetProfile | undefined;
  onProfileEdit: () => void;
  onUpdateProgress: (data: Partial<ProgressData>) => void;
  onAddTodo: (text: string, category?: TodoItem["category"]) => void;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

const ChatSidebar = ({
  userProfile,
  activeTarget,
  onProfileEdit,
  onUpdateProgress,
  onAddTodo,
  onUpdateProfile,
}: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to Version2 AI! I'm your career distance engine. Update me on your semester status or daily plans to keep your dashboard live.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistory = useRef(false);

  useEffect(() => {
    if (userProfile?.chatHistory && userProfile.chatHistory.length > 0 && !hasLoadedHistory.current) {
      const loadedMessages = userProfile.chatHistory.map((m: any) => ({
        ...m,
        timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(m.timestamp),
      }));

      const lastMessage = loadedMessages[loadedMessages.length - 1];
      const lastDate = lastMessage.timestamp;
      const today = new Date();

      const isNewDay = lastDate.getDate() !== today.getDate() ||
        lastDate.getMonth() !== today.getMonth() ||
        lastDate.getFullYear() !== today.getFullYear();

      if (isNewDay) {
        const dailyPrompt: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Ready for a new day of grinding? ⚔️ What's your main focus today? Tell me your plan so I can update your dashboard!",
            timestamp: new Date()
         };
         loadedMessages.push(dailyPrompt);
         onUpdateProfile({ chatHistory: loadedMessages });
      }

      setMessages(loadedMessages);
      hasLoadedHistory.current = true;
    }
  }, [userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  const saveChatHistory = (newMessages: Message[]) => {
    onUpdateProfile({ chatHistory: newMessages });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const result = await processUserChat(userMessage.content, userProfile);
      
      if (result.profileUpdates) {
        let updatedProfile = { ...result.profileUpdates };
        if (result.profileUpdates.achievements && userProfile?.achievements) {
             updatedProfile.achievements = [
                 ...userProfile.achievements,
                 ...result.profileUpdates.achievements
             ];
        }
        onUpdateProfile(updatedProfile);
      }
      
      if (result.progressUpdates) {
        onUpdateProgress(result.progressUpdates);
      }
      
      if (result.todoUpdates) {
        result.todoUpdates.forEach(todo => {
          onAddTodo(todo.text, todo.category);
        });
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };
      
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having a bit of trouble connecting to my brain right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full w-[400px] flex-col border-r-4 border-black bg-sidebar shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)] font-sans"
    >
      <div className="flex items-center justify-between border-b-4 border-black p-4 bg-white">
        <div className="flex items-center gap-2">
          <img 
            src="/version-logo.png" 
            alt="Version2" 
            className="h-8 w-auto object-contain" 
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onProfileEdit}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* User & Target Info */}
      <div className="space-y-3 border-b-4 border-black p-4 bg-secondary/30">
        {userProfile && (
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 p-3 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-400 border-2 border-black">
              <User className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold font-display uppercase tracking-wide">{userProfile.name}</div>
              <div className="text-xs text-muted-foreground font-medium">
                {userProfile.degree} • Sem {userProfile.semester}
              </div>
            </div>
          </div>
        )}

        {activeTarget && (
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 p-3 rounded-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500 border-2 border-black">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold font-display uppercase tracking-wide">{activeTarget.name}</div>
              <div className="text-xs text-muted-foreground font-medium">
                {activeTarget.title}
              </div>
            </div>
            <div className="rounded-md bg-green-400 border border-black px-2 py-0.5 text-[10px] font-bold uppercase text-black">
              Active
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${
                  msg.role === "user" 
                    ? "bg-white text-black rounded-tr-none" 
                    : "bg-yellow-100 text-black rounded-tl-none"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-bold uppercase text-yellow-700 font-display">
                      Version2 AI
                    </span>
                  </div>
                )}
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-yellow-100 border-2 border-black rounded-xl rounded-tl-none max-w-[85%] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:0ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t-4 border-black p-4 bg-white">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all">
            <Upload className="h-4 w-4" />
          </Button>
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Update progress..."
              className="pr-10 border-2 border-black shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)] focus-visible:ring-0 focus-visible:ring-offset-0 font-medium"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSend}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
            >
              <Send className="h-4 w-4 text-black hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Try: "Midsems are over" or "I will study React today"
        </p>
      </div>
    </div>
  );
};

export default ChatSidebar;
