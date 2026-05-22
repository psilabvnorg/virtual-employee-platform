export interface ProcessResult {
  normalizedJson: Record<string, unknown>;
  suggestions: unknown[];
  confidence: number;
}

export abstract class BaseEmployee {
  abstract readonly name: string;
  abstract readonly label: string;
  abstract process(ocrText: string, category: string): Promise<ProcessResult>;
}
