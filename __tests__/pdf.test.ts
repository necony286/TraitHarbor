import { describe, expect, it } from 'vitest';
import { buildReportHtml, traitSectionOrder } from '../lib/pdf';

describe('report template', () => {
  it('hydrates report html with trait scores', async () => {
    const traits = {
      O: 85,
      C: 70,
      E: 60,
      A: 55,
      N: 45
    };
    const html = await buildReportHtml({
      name: 'Alex',
      date: new Date(Date.UTC(2024, 0, 2, 12, 0, 0)),
      traits
    });

    expect(html).toContain("Alex's Personality Profile");
    expect(html).not.toContain('{{trait_sections}}');
    const expectedTraits = traitSectionOrder.map(({ name, token, scoreKey }) => ({
      name,
      token,
      score: traits[scoreKey]
    }));

    for (const trait of expectedTraits) {
      expect(html).toContain(`${trait.name} — {{trait_${trait.token}_band}} (${trait.score}%)`);
    }
    for (const score of Object.values(traits)) {
      expect(html).toContain(`${score}%`);
    }
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
