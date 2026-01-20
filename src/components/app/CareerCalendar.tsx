import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TodoItem } from "@/pages/AppPage";

interface CareerCalendarProps {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onAddTodo: (text: string, category?: "dsa" | "project" | "learning" | "other") => void;
}

interface DayActivity {
  date: Date;
  level: "none" | "light" | "productive" | "intense";
  todos: TodoItem[];
}

const categoryColors = {
  dsa: "bg-chart-1/20 text-chart-1 border-chart-1/50",
  project: "bg-chart-2/20 text-chart-2 border-chart-2/50",
  learning: "bg-chart-3/20 text-chart-3 border-chart-3/50",
  other: "bg-chart-4/20 text-chart-4 border-chart-4/50",
};

const categoryLabels = {
  dsa: "DSA",
  project: "Project",
  learning: "Learning",
  other: "Other",
};

const CareerCalendar = ({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onAddTodo,
}: CareerCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TodoItem["category"]>("dsa");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const todoListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleAddTodo = () => {
    if (!newTodo.trim() || !selectedDate) return;
    
    onAddTodo(newTodo, selectedCategory);
    setNewTodo("");

    setTimeout(() => {
      if (todoListRef.current) {
        const lastChild = todoListRef.current.lastElementChild;
        if (lastChild) {
          gsap.fromTo(
            lastChild,
            { opacity: 0, x: -20, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
          );
        }
      }
    }, 10);
  };

  const selectedDateTodos = todos.filter(
    (todo) => selectedDate && new Date(todo.date).toDateString() === selectedDate.toDateString()
  );

  const getDayModifiers = () => {
    const modifiers: Record<string, Date[]> = {
      productive: [],
      light: [],
      none: [],
    };

    const dateMap = new Map<string, TodoItem[]>();
    todos.forEach((todo) => {
      const dateStr = new Date(todo.date).toDateString();
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, []);
      }
      dateMap.get(dateStr)?.push(todo);
    });

    dateMap.forEach((dayTodos, dateStr) => {
      const completedCount = dayTodos.filter((t) => t.completed).length;
      const date = new Date(dateStr);
      
      if (completedCount >= 3) {
        modifiers.productive.push(date);
      } else if (completedCount >= 1) {
        modifiers.light.push(date);
      }
    });

    return modifiers;
  };

  const completedCount = selectedDateTodos.filter((t) => t.completed).length;
  const totalCount = selectedDateTodos.length;

  return (
    <div ref={containerRef} className="grid gap-6 lg:grid-cols-2">
      <div className="glass-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold">Career Calendar</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="pointer-events-auto"
          modifiers={getDayModifiers()}
          modifiersStyles={{
            productive: {
              backgroundColor: "hsl(var(--chart-5) / 0.3)",
              color: "hsl(var(--chart-5))",
              fontWeight: "bold",
            },
            light: {
              backgroundColor: "hsl(var(--chart-3) / 0.3)",
              color: "hsl(var(--chart-3))",
            },
          }}
        />
        
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-chart-5/30" />
            <span className="text-muted-foreground">Productive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-chart-3/30" />
            <span className="text-muted-foreground">Light Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-muted/50" />
            <span className="text-muted-foreground">No Activity</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">
            {selectedDate?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h3>
          {totalCount > 0 && (
            <Badge variant="outline" className="border-primary/50 text-primary">
              {completedCount}/{totalCount} completed
            </Badge>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as TodoItem["category"][]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                categoryColors[cat],
                selectedCategory === cat
                  ? "ring-2 ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Add Todo */}
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            className="flex-1 bg-secondary/50 border-border/50"
          />
          <Button
            size="icon"
            onClick={handleAddTodo}
            disabled={!newTodo.trim()}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div ref={todoListRef} className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {selectedDateTodos.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Circle className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p className="text-sm">No tasks for this day</p>
              <p className="text-xs opacity-60">Add one above to get started</p>
            </div>
          ) : (
            selectedDateTodos.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  "group flex items-center gap-3 rounded-lg border p-3 transition-all",
                  "bg-secondary/30 border-border/50 hover:bg-secondary/50",
                  todo.completed && "opacity-60"
                )}
              >
                <button
                  onClick={() => onToggleTodo(todo.id)}
                  className="shrink-0 text-primary transition-transform hover:scale-110"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm truncate",
                      todo.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {todo.text}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px]", categoryColors[todo.category])}
                >
                  {categoryLabels[todo.category]}
                </Badge>
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="shrink-0 text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Daily Progress</span>
              <span>{Math.round((completedCount / totalCount) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500 progress-glow"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerCalendar;