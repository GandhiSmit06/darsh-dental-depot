import { Parser } from 'json2csv';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export const exportToCSV = <T extends object>(
  data: T[],
  fields: { label: string; value: string }[],
): string => {
  const parser = new Parser({ fields });
  return parser.parse(data);
};

export const parseCSVBuffer = <T>(buffer: Buffer): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csvParser())
      .on('data', (row: T) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
