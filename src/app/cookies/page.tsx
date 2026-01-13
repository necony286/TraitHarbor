export const metadata = {
  title: 'Cookie Policy | TraitHarbor',
  description: 'Cookie policy for the TraitHarbor personality assessment.'
};

export default function CookiesPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cookie policy</p>
        <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
        <p className="text-base text-slate-600">Draft outline for review. Summarizes how we use cookies for analytics.</p>
      </header>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
        <li>What cookies are</li>
        <li>Cookies we set</li>
        <li>Analytics cookies</li>
        <li>Managing preferences</li>
        <li>Contact</li>
      </ol>
    </section>
  );
}
