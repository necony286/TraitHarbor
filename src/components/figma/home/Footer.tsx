import Link from 'next/link';
import { Container } from '../../../../components/ui/Container';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container className="py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-medium text-foreground mb-2">TraitHarbor</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              This test is for informational purposes only and does not constitute medical, psychological, or professional
              advice.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/quiz/quick" className="text-muted-foreground hover:text-foreground transition-colors duration-150">
              Quick quiz
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors duration-150">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-150">
              Terms
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">© 2026 TraitHarbor. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
