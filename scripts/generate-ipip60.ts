import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import ipip120 from '../src/data/ipip120.json';
import facetMap from '../src/data/ipip120.facets.json';

type QuizItem = {
  id: string;
  prompt: string;
  trait: 'O' | 'C' | 'E' | 'A' | 'N';
  reverseKeyed: boolean;
};

const byQuestionNumber = (left: QuizItem, right: QuizItem) =>
  Number(left.id.replace(/^Q/, '')) - Number(right.id.replace(/^Q/, ''));

const getFacetOrder = (items: QuizItem[], mapping: Record<string, string>) => {
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const facetKey = mapping[item.id];
    if (!facetKey || seen.has(facetKey)) continue;
    seen.add(facetKey);
    ordered.push(facetKey);
  }

  return ordered;
};

const pickFacetItems = (items: QuizItem[]) => {
  const forward = items.find((item) => !item.reverseKeyed);
  const reverse = items.find((item) => item.reverseKeyed);

  if (forward && reverse) {
    return [forward, reverse].sort(byQuestionNumber);
  }

  return items.slice().sort(byQuestionNumber).slice(0, 2);
};

export const buildIpip60Items = ({
  items,
  mapping
}: {
  items: QuizItem[];
  mapping: Record<string, string>;
}): QuizItem[] => {
  const itemsByFacet = new Map<string, QuizItem[]>();
  const itemById = new Map(items.map((item) => [item.id, item]));

  for (const [itemId, facetKey] of Object.entries(mapping)) {
    const item = itemById.get(itemId);
    if (!item) {
      throw new Error(`Facet map references missing item: ${itemId}`);
    }

    const bucket = itemsByFacet.get(facetKey) ?? [];
    bucket.push(item);
    itemsByFacet.set(facetKey, bucket);
  }

  const selectedById = new Map<string, QuizItem>();
  const facetOrder = getFacetOrder(items, mapping);

  for (const facetKey of facetOrder) {
    const facetItems = itemsByFacet.get(facetKey) ?? [];
    if (facetItems.length < 2) {
      throw new Error(`Facet ${facetKey} has fewer than 2 items.`);
    }

    for (const selected of pickFacetItems(facetItems)) {
      selectedById.set(selected.id, selected);
    }
  }

  const output = items
    .filter((item) => selectedById.has(item.id))
    .map((item) => {
      const { id, prompt, trait, reverseKeyed } = item;
      return { id, prompt, trait, reverseKeyed };
    });

  if (output.length !== 60) {
    throw new Error(`Generated IPIP-60 must contain 60 items, got ${output.length}.`);
  }

  return output;
};

export const generateIpip60Json = () =>
  buildIpip60Items({
    items: (ipip120 as QuizItem[]) ?? [],
    mapping: (facetMap as Record<string, string>) ?? {}
  });

const run = async () => {
  const outputPath = path.join(process.cwd(), 'src', 'data', 'ipip60.json');
  const generated = generateIpip60Json();
  await writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Generated ${generated.length} items -> ${outputPath}`);
};

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
