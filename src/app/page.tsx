import { TokenPreview } from '../../components/design-system/TokenPreview';

export default function HomePage() {
  return (
    <div className="hero">
      <section className="hero__content">
        <p className="eyebrow">Personality, made clear</p>
        <h1>BigFive experience</h1>
        <p className="muted">
          A calm, research-backed flow for the IPIP-120 questionnaire with accessible controls, progress feedback, and
          privacy-first defaults.
        </p>
        <div className="cta-row" id="get-started">
          <a className="button" href="#tokens">
            View design tokens
          </a>
          <a className="button button--ghost" href="https://ipip.ori.org/" target="_blank" rel="noreferrer">
            Read about the Big Five
          </a>
        </div>
      </section>
      <section className="hero__aside" aria-label="Experience highlights">
        <ul>
          <li>Next.js 15 with app router</li>
          <li>Pnpm + Vitest + Playwright ready</li>
          <li>Design system tokens aligned to our brief</li>
        </ul>
      </section>
      <div id="tokens" className="home-section">
        <TokenPreview />
      </div>
    </div>
  );
}
