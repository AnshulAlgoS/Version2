import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="border-t border-border py-20">
      <div className="container mx-auto text-center">
        <h2 className="font-display text-3xl font-semibold">
          Ready to measure your distance?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Upload your resume and see exactly where you stand. No account needed.
        </p>
        <div className="mt-8">
          <Link to="/app">
            <Button size="lg" className="gap-2">
              Start comparing
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
