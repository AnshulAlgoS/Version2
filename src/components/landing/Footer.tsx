import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
              <span className="text-[10px] font-semibold text-primary-foreground">V2</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Version2 AI
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="/" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <span>© 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;