import Link from 'next/link';
import { TokenPreview } from '../../components/design-system/TokenPreview';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Container } from '../../components/ui/Container';

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <Container className="hero__grid">
          <div className="hero__content">
            <Badge>120 questions • ~15 min • no signup</Badge>
            <p className="eyebrow">Personality, made clear</p>
            <h1>Meet the TraitHarbor personality quiz</h1>
            <p className="muted">
              A friendly, research-backed walk through the IPIP-120 questionnaire with autosave, clear progress, and
              gentle guidance as you go.
            </p>
            <div className="cta-row" id="get-started">
              <Link className="ui-button ui-button--primary" href="/quiz">
                Start the quiz
              </Link>
              <a className="ui-button ui-button--secondary" href="https://ipip.ori.org/" target="_blank" rel="noopener noreferrer">
                About the five-factor model
              </a>
            </div>
            <div className="hero__stats">
              <div>
                <p className="hero__stat-value">100%</p>
                <p className="muted">Free to start</p>
              </div>
              <div>
                <p className="hero__stat-value">5 traits</p>
                <p className="muted">Based on IPIP-120</p>
              </div>
              <div>
                <p className="hero__stat-value">Autosave</p>
                <p className="muted">Pick up anytime</p>
              </div>
            </div>
          </div>
          <Card className="hero__preview" aria-label="Quiz preview card">
            <div className="hero__preview-header">
              <p className="eyebrow">Preview</p>
              <h2>Questions like…</h2>
              <p className="muted">You’ll rate how much you agree with each statement.</p>
            </div>
            <ul className="hero__question-list">
              <li>“I feel energized when meeting new people.”</li>
              <li>“I keep my workspace organized.”</li>
              <li>“I stay calm under pressure.”</li>
            </ul>
            <div className="hero__preview-footer">
              <span className="muted">5-point scale</span>
              <span className="muted">Neutral is always okay</span>
            </div>
          </Card>
        </Container>
      </section>

      <section id="questions" className="home-section">
        <Container>
          <div className="section-heading">
            <p className="eyebrow">Questions like…</p>
            <h2>Thoughtful prompts, clear choices</h2>
            <p className="muted">
              Every prompt uses the same five-point agreement scale so you can move quickly without losing nuance.
            </p>
          </div>
          <div className="question-preview-grid">
            <Card className="question-preview-card">
              <p className="eyebrow">Extraversion</p>
              <h3>I make friends easily.</h3>
              <p className="muted">Pick from Strongly disagree → Strongly agree.</p>
            </Card>
            <Card className="question-preview-card">
              <p className="eyebrow">Conscientiousness</p>
              <h3>I follow through on plans.</h3>
              <p className="muted">Take your time—answers autosave as you go.</p>
            </Card>
            <Card className="question-preview-card">
              <p className="eyebrow">Neuroticism</p>
              <h3>I worry about things.</h3>
              <p className="muted">No trick questions. Just honest reflections.</p>
            </Card>
          </div>
        </Container>
      </section>

      <section id="tokens" className="home-section">
        <Container>
          <TokenPreview />
        </Container>
      </section>
    </div>
  );
}
