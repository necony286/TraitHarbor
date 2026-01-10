import { describe, expect, it } from 'vitest';
import { buildReportHtml } from '../lib/pdf';

describe('report template', () => {
  it('hydrates report html with trait scores', async () => {
    const html = await buildReportHtml({
      name: 'Alex',
      date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
      traits: {
        O: 85,
        C: 70,
        E: 60,
        A: 55,
        N: 45
      }
    });

    expect(html).toContain("Alex's Personality Profile");
    expect(html).toContain('85%');
    expect(html).toContain('70%');
    expect(html).toContain('60%');
    expect(html).toContain('55%');
    expect(html).toContain('45%');
  });

  it('escapes user-provided strings in the report template', async () => {
    const html = await buildReportHtml({
      name: '<script>alert("x")</script>',
      date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
      traits: {
        O: 85,
        C: 70,
        E: 60,
        A: 55,
        N: 45
      }
    });

    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert("x")</script>');
  });
});
