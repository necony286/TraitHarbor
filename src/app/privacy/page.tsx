export const metadata = {
  title: 'Privacy Policy | TraitHarbor',
  description: 'Privacy policy for the TraitHarbor personality assessment.'
};

export default function PrivacyPolicyPage() {
  return (
    <section className="legal">
      <header>
        <p className="eyebrow">Privacy policy</p>
        <h1>Privacy Policy</h1>
        <p className="muted">Draft outline for review. Summarizes how we handle quiz data and reports.</p>
      </header>
      <ol className="legal__list">
        <li>Information we collect</li>
        <li>How we use your information</li>
        <li>Data storage &amp; retention</li>
        <li>Security practices</li>
        <li>Analytics &amp; cookies</li>
        <li>Third-party processors</li>
        <li>Your rights</li>
        <li>International transfers</li>
        <li>Contact</li>
      </ol>
    </section>
  );
}
