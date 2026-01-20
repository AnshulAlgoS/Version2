import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/version-logo.png" alt="Version2 Logo" className="h-14 w-auto" />
          <span className="font-display text-xl font-bold tracking-tight">
            Version2
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;