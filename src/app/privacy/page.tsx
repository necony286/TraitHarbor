export const metadata = {
  title: 'Privacy Policy | TraitHarbor',
  description: 'Privacy policy for the TraitHarbor personality assessment.'
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Privacy policy</p>
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-base text-slate-600">Draft outline for review. Summarizes how we handle quiz data and reports.</p>
      </header>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
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
