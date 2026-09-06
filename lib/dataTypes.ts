export type CsvScalar = string | number | boolean | null | undefined;
export interface CsvRecord {
  [key: string]: CsvValue;
}

export type CsvValue = CsvScalar | CsvRecord | CsvValue[];

export type BovinoReference = {
  id: string;
  arete: string;
  nombre: string | null;
};

export function getErrorMessage(error: unknown, fallback = "Error desconocido"): string {
  return error instanceof Error ? error.message : fallback;
}
