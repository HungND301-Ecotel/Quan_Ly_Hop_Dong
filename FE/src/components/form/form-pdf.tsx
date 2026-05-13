import * as pdfjs from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

export type FormPdfProps = {
  file?: File;
  url?: string;
};

export function FormPdf() {
  return <div>FormPdf</div>;
}
