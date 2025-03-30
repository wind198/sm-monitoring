export type ILighthouseResult = JSON;

export type ICheckRunResult = {
  ok: boolean;
  runIndex: number;
  result: ILighthouseResult | null;
};

export type ILighthouseScores = {
  performance: number | null;
  accessibility: number | null;
  'best-practices': number | null;
  seo: number | null;
};

export type IScreenshotThumbnail = {
  timing: number;
  data: string;
};
