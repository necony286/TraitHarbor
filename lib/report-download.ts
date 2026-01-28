import { z } from 'zod';
import {
  BrowserlessConfigError,
  PdfRenderConcurrencyError,
  generateReportPdf,
  traitSectionOrder
} from './pdf';
import {
  getFacetScoresByResultId,
  getReportAsset,
  getScoresByResultId,
  storeReportAsset,
  updateOrderReportFileKey
} from './db';
import { logWarn } from './logger';
import {
  getLegacyReportPath,
  getReportPath,
  getReportSignedUrl,
  getReportSignedUrlForPath,
  uploadReport
} from './storage';

export class ReportGenerationError extends Error {
  code: 'RESULT_NOT_FOUND' | 'RESULT_INVALID' | 'SIGNED_URL_MISSING';

  constructor(code: ReportGenerationError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

const traitsSchema = z.object({
  O: z.number(),
  C: z.number(),
  E: z.number(),
  A: z.number(),
  N: z.number()
});

const resultSchema = z.object({
  id: z.string().uuid(),
  traits: traitsSchema
});

type TraitName = (typeof traitSectionOrder)[number]['name'];
type TraitPercentages = Record<TraitName, number>;
type TraitData = {
  traitPercentages: TraitPercentages;
  traitRankOrder: TraitName[];
  highestTrait: TraitName | '';
  lowestTrait: TraitName | '';
};

export const buildReportTraitData = (traits: z.infer<typeof traitsSchema>): TraitData => {
  const traitScores = traitSectionOrder.map(({ name, scoreKey }, index) => ({
    name,
    score: traits[scoreKey],
    index
  }));

  const traitRankOrder = traitScores
    .slice()
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.index - b.index;
    })
    .map((trait) => trait.name);

  const traitPercentages = Object.fromEntries(
    traitScores.map(({ name, score }) => [name, score])
  ) as TraitPercentages;

  return {
    traitPercentages,
    traitRankOrder,
    highestTrait: traitRankOrder[0] ?? '',
    lowestTrait: traitRankOrder[traitRankOrder.length - 1] ?? ''
  };
};

type OrderDetail = {
  id: string;
  response_id?: string | null;
  created_at: string;
  report_file_key?: string | null;
  user_id?: string | null;
};

const resolveReportFileKey = async (order: OrderDetail, reportPath: string) => {
  if (order.report_file_key) {
    return order.report_file_key;
  }

  const { data: existingAsset } = await getReportAsset(order.id, 'report_pdf');
  if (existingAsset?.path) {
    await updateOrderReportFileKey({ orderId: order.id, reportFileKey: existingAsset.path });
    return existingAsset.path;
  }

  return reportPath;
};

export const getOrCreateReportDownloadUrl = async ({
  order,
  ttlSeconds
}: {
  order: OrderDetail;
  ttlSeconds: number;
}) => {
  const reportPath = getReportPath(order.id);
  const legacyReportPath = getLegacyReportPath(order.id);
  const reportFileKey = await resolveReportFileKey(order, reportPath);

  const pathsToTry = [...new Set([reportPath, reportFileKey, legacyReportPath])].filter(Boolean);

  for (const pathToTry of pathsToTry) {
    const signedUrl = await getReportSignedUrlForPath(pathToTry, ttlSeconds);
    if (signedUrl) {
      if (order.report_file_key !== pathToTry) {
        await updateOrderReportFileKey({ orderId: order.id, reportFileKey: pathToTry });
      }
      return { url: signedUrl, cached: true, reportFileKey: pathToTry };
    }
  }

  if (!order.response_id) {
    throw new ReportGenerationError('RESULT_NOT_FOUND', 'Result not attached to order.');
  }

  const { data: traits, error: resultError } = await getScoresByResultId(order.response_id);
  if (resultError || !traits) {
    throw new ReportGenerationError('RESULT_NOT_FOUND', 'Result not found.');
  }

  const parsedResult = resultSchema.safeParse({ id: order.response_id, traits });
  if (!parsedResult.success) {
    throw new ReportGenerationError('RESULT_INVALID', 'Invalid result payload.');
  }

  const { traitPercentages, traitRankOrder, highestTrait, lowestTrait } = buildReportTraitData(
    parsedResult.data.traits
  );
  const { data: facetScores, error: facetError } = await getFacetScoresByResultId(order.response_id);
  if (facetError) {
    logWarn('Unable to fetch facet scores.', {
      resultId: order.response_id,
      message: facetError.message
    });
  }

  const pdfBuffer = await generateReportPdf({
    date: new Date(order.created_at),
    traits: parsedResult.data.traits,
    traitPercentages,
    traitRankOrder,
    highestTrait,
    lowestTrait,
    facetScores: facetScores ?? undefined
  });

  await uploadReport(order.id, pdfBuffer);

  const signedUrl = await getReportSignedUrl(order.id, ttlSeconds);
  if (!signedUrl) {
    throw new ReportGenerationError('SIGNED_URL_MISSING', 'Unable to create signed report URL.');
  }

  await updateOrderReportFileKey({ orderId: order.id, reportFileKey: reportPath });

  if (order.user_id) {
    await storeReportAsset({
      orderId: order.id,
      userId: order.user_id,
      reportPath,
      kind: 'report_pdf'
    });
  }

  return { url: signedUrl, cached: false, reportFileKey: reportPath };
};

export { BrowserlessConfigError, PdfRenderConcurrencyError };
