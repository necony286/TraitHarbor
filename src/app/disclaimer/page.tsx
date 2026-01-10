export const metadata = {
  title: 'Disclaimer | TraitHarbor',
  description: 'Non-clinical disclaimer for the TraitHarbor personality assessment.'
};

export default function DisclaimerPage() {
  return (
    <section className="legal">
      <header>
        <p className="eyebrow">Disclaimer</p>
        <h1>Disclaimer</h1>
        <p className="muted">Draft outline for review. The assessment is not medical advice.</p>
      </header>
      <ol className="legal__list">
        <li>Informational purposes only</li>
        <li>Not a diagnostic tool</li>
        <li>No guarantees of outcomes</li>
        <li>Seek professional guidance when needed</li>
        <li>Contact</li>
      </ol>
    </section>
  );
}
