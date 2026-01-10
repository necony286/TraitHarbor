export const metadata = {
  title: 'Cookie Policy | TraitHarbor',
  description: 'Cookie policy for the TraitHarbor personality assessment.'
};

export default function CookiePolicyPage() {
  return (
    <section className="legal">
      <header>
        <p className="eyebrow">Cookie policy</p>
        <h1>Cookie Policy</h1>
        <p className="muted">Draft outline for review. Covers essential and analytics usage.</p>
      </header>
      <ol className="legal__list">
        <li>Essential cookies (session, auth)</li>
        <li>Analytics (Plausible)</li>
        <li>Marketing pixels (none in MVP)</li>
        <li>Managing cookie preferences</li>
        <li>Contact</li>
      </ol>
    </section>
  );
}
