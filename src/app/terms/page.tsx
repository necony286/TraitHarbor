export const metadata = {
  title: 'Terms of Service | BigFive',
  description: 'Terms of Service for the BigFive personality assessment.'
};

export default function TermsPage() {
  return (
    <section className="legal">
      <header>
        <p className="eyebrow">Terms of Service</p>
        <h1>Terms of Service</h1>
        <p className="muted">Draft outline for review. Please consult counsel before launch.</p>
      </header>
      <ol className="legal__list">
        <li>Agreement</li>
        <li>Services</li>
        <li>Accounts &amp; eligibility</li>
        <li>Purchases &amp; refunds</li>
        <li>Intellectual property</li>
        <li>Acceptable use</li>
        <li>Disclaimers (non-clinical)</li>
        <li>Limitation of liability</li>
        <li>Governing law &amp; disputes</li>
        <li>Contact</li>
      </ol>
    </section>
  );
}
