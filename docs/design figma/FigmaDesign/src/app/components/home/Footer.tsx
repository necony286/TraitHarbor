export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="font-medium text-foreground mb-2">TraitHarbor</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              This test is for informational purposes only and does not
              constitute medical, psychological, or professional advice.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <button className="text-muted-foreground hover:text-foreground transition-colors duration-150">
              Privacy
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors duration-150">
              Terms
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 TraitHarbor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
