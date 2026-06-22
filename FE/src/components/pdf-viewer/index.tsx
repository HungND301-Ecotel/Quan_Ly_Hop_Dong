import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FileTextIcon,
  PenLineIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { RenderParameters } from 'pdfjs-dist/types/src/display/api';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

export type PdfViewerProps = {
  file?: File;
  url?: string;
  onPageClick?: (
    event: MouseEvent<HTMLCanvasElement, globalThis.MouseEvent> & {
      page: number;
      ref?: HTMLCanvasElement;
    }
  ) => void;
  signBoxes?: React.ReactNode;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSignButtonClick?: (position: {
    positionX: number;
    positionY: number;
    pageNumber: number;
    canvasWidth: number;
    canvasHeight: number;
  }) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
};

export function PdfViewer({
  file,
  url,
  onPageClick,
  signBoxes,
  onPageChange,
  onSignButtonClick,
  currentPage: externalPage,
  zoom: externalZoom,
  onZoomChange,
}: PdfViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy>();
  const [internalPage, setInternalPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const currentPage = externalPage ?? internalPage;
  const setCurrentPage = useCallback(
    (page: number) => {
      setInternalPage(page);
      onPageChange?.(page);
    },
    [onPageChange]
  );
  const [internalZoom, setInternalZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [renderingPage, setRenderingPage] = useState<number>();

  const zoom = externalZoom ?? internalZoom;
  const setZoom = onZoomChange ?? setInternalZoom;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        let pdf: pdfjsLib.PDFDocumentProxy;

        if (file) {
          const arrayBuffer = await file.arrayBuffer();
          pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        } else if (url) {
          pdf = await pdfjsLib.getDocument(url).promise;
        } else {
          throw new Error('No file or URL provided');
        }

        setPdf(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [file, setCurrentPage, url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        setRenderingPage(currentPage);

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        const viewport = page.getViewport({ scale: zoom });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext: RenderParameters = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (error) {
        console.error(error);
      } finally {
        setRenderingPage(undefined);
        renderTaskRef.current = null;
      }
    };

    renderPage();
  }, [pdf, currentPage, zoom]);

  const goToPage = useCallback(
    (pageNum: number) => {
      const newPage = Math.max(1, Math.min(pageNum, totalPages));
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    },
    [totalPages, onPageChange, setCurrentPage]
  );

  const handleFirstPage = () => goToPage(1);
  const handlePreviousPage = () => goToPage(currentPage - 1);
  const handleNextPage = () => goToPage(currentPage + 1);
  const handleLastPage = () => goToPage(totalPages);
  // const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  // const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const handlePageChange = (value: string) => {
    const page = Number.parseInt(value) || 1;
    goToPage(page);
  };

  return (
    <Card className='p-0 gap-0'>
      <CardHeader className='flex justify-between border-b items-center p-4 [.border-b]:pb-4'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
            disabled={zoom <= 0.5}
          >
            <ZoomOutIcon className='size-4' />
          </Button>

          <span className='text-sm font-medium text-muted-foreground min-w-12 text-center'>
            {Math.round(zoom * 100)}%
          </span>

          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() => setZoom(Math.min(zoom + 0.25, 3))}
            disabled={zoom >= 3}
          >
            <ZoomInIcon className='size-4' />
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={handleFirstPage}
            disabled={currentPage <= 1}
          >
            <ChevronsLeftIcon className='size-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeftIcon className='size-4' />
          </Button>

          <Select value={String(currentPage)} onValueChange={handlePageChange}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {Array.from({ length: totalPages }, (_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    Trang {i + 1}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRightIcon className='size-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={handleLastPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronsRightIcon className='size-4' />
          </Button>
        </div>

        {onSignButtonClick && (
          <Button
            type='button'
            variant='default'
            size='lg'
            onClick={() => {
              if (!canvasRef.current) return;
              const rect = canvasRef.current.getBoundingClientRect();
              onSignButtonClick({
                positionX: rect.width / 2,
                positionY: rect.height / 2,
                pageNumber: currentPage,
                canvasWidth: rect.width,
                canvasHeight: rect.height,
              });
            }}
            title='Thêm chữ ký vào giữa trang'
          >
            <PenLineIcon className='size-4' />
            <span>Thêm chữ ký</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className='flex-1 overflow-auto flex items-center justify-center bg-muted p-4'>
        {isLoading ? (
          <Spinner />
        ) : pdf ? (
          <div className='bg-card rounded-lg shadow-lg overflow-hidden border relative size-fit'>
            <canvas
              ref={canvasRef}
              className={cn(
                'max-w-full h-auto cursor-crosshair',
                renderingPage === currentPage && 'opacity-50'
              )}
              onClick={(event) =>
                onPageClick?.({
                  ...event,
                  page: currentPage,
                  ref: canvasRef.current || undefined,
                })
              }
            />
            {signBoxes && (
              <div className='absolute inset-0 pointer-events-none'>
                {signBoxes}
              </div>
            )}
            {renderingPage === currentPage && <Spinner />}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>Không có tài liệu nào để hiển thị</EmptyTitle>
              <EmptyDescription>
                Vui lòng chọn một tài liệu để xem
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
