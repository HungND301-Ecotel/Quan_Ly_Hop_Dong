import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { SignatureType } from '@/constants/signature-type';
import { cn } from '@/lib/utils';
import { fileService } from '@/services/file';
import { XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ResizeType =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left';

type SignBoxProps = {
  positionX: number;
  positionY: number;
  pageNumber: number;
  userId: string;
  signatureType: number;
  width: number;
  height: number;
  signerName?: string;
  signatureFile?: string;
  onRemove: () => void;
  currentPage: number;
  onPositionChange?: (newX: number, newY: number) => void;
  onSizeChange?: (
    newWidth: number,
    newHeight: number,
    newX?: number,
    newY?: number
  ) => void;
  zoom?: number;
};

export function SignBox({
  positionX,
  positionY,
  pageNumber,
  userId,
  signatureType,
  width,
  height,
  signerName,
  signatureFile,
  onRemove,
  currentPage,
  onPositionChange,
  onSizeChange,
  zoom = 1,
}: SignBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({
    x: positionX,
    y: positionY,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<ResizeType | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    positionX: 0,
    positionY: 0,
  });
  const [currentSize, setCurrentSize] = useState({
    width,
    height,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(!!signatureFile);

  const boxRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(currentPosition);
  const sizeRef = useRef(currentSize);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    if (!signatureFile) {
      setImageSrc((prev) => (prev === null ? null : null));
      setImageLoading((prev) => (prev === false ? false : false));
      return;
    }

    setImageLoading(true);
    fileService
      .getFile(signatureFile, false)
      .then((file: File) => {
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(file);
        setImageSrc(objectUrl);
      })
      .catch((error: Error) => {
        if (!isMounted) return;
        console.error('Lỗi khi tải ảnh chữ ký:', error);
      })
      .finally(() => {
        if (isMounted) setImageLoading(false);
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [signatureFile]);

  // Update positionRef when currentPosition changes
  useEffect(() => {
    positionRef.current = currentPosition;
  }, [currentPosition]);

  // Update sizeRef when currentSize changes
  useEffect(() => {
    sizeRef.current = currentSize;
  }, [currentSize]);

  // Use prop values when not dragging/resizing, current values when dragging/resizing
  const displayPosition =
    isDragging || isResizing ? currentPosition : { x: positionX, y: positionY };

  const displaySize = isResizing ? currentSize : { width, height };

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging || !onPositionChange) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!boxRef.current) return;

      // Find the canvas container (parent with relative positioning)
      const canvasContainer = boxRef.current.closest('.relative');
      if (!canvasContainer) return;

      const containerRect = canvasContainer.getBoundingClientRect();
      const canvasWidth = containerRect.width;
      const canvasHeight = containerRect.height;

      // Calculate new position relative to canvas container
      const newX = (e.clientX - containerRect.left - dragOffset.x) / zoom;
      const newY = (e.clientY - containerRect.top - dragOffset.y) / zoom;

      // Calculate maximum allowed position (use actual width/height, not displaySize)
      const canvasWidthNormalized = canvasWidth / zoom;
      const canvasHeightNormalized = canvasHeight / zoom;
      const boxWidth = displaySize.width;
      const boxHeight = displaySize.height;
      const maxX = Math.max(0, canvasWidthNormalized - boxWidth);
      const maxY = Math.max(0, canvasHeightNormalized - boxHeight);

      // Ensure position is within bounds (0 to max)
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      setCurrentPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Call onPositionChange with the final position from ref
      if (onPositionChange) {
        onPositionChange(positionRef.current.x, positionRef.current.y);
      }
      setDragOffset({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    dragOffset,
    onPositionChange,
    displaySize.width,
    displaySize.height,
    zoom,
  ]);

  // Handle resize during mouse move
  useEffect(() => {
    if (!isResizing || !onSizeChange || !resizeType) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!boxRef.current) return;

      // Find the canvas container to get dimensions
      const canvasContainer = boxRef.current.closest('.relative');
      if (!canvasContainer) return;

      const containerRect = canvasContainer.getBoundingClientRect();
      const canvasWidth = containerRect.width;
      const canvasHeight = containerRect.height;

      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;

      const canvasWidthNormalized = canvasWidth / zoom;
      const canvasHeightNormalized = canvasHeight / zoom;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.positionX;
      let newY = resizeStart.positionY;

      // Calculate new dimensions based on resize type
      switch (resizeType) {
        case 'bottom-right':
          newWidth = resizeStart.width + deltaX;
          newHeight = resizeStart.height + deltaY;
          break;
        case 'bottom-left':
          newWidth = resizeStart.width - deltaX;
          newHeight = resizeStart.height + deltaY;
          newX = resizeStart.positionX + deltaX;
          break;
        case 'top-right':
          newWidth = resizeStart.width + deltaX;
          newHeight = resizeStart.height - deltaY;
          newY = resizeStart.positionY + deltaY;
          break;
        case 'top-left':
          newWidth = resizeStart.width - deltaX;
          newHeight = resizeStart.height - deltaY;
          newX = resizeStart.positionX + deltaX;
          newY = resizeStart.positionY + deltaY;
          break;
        case 'top':
          newHeight = resizeStart.height - deltaY;
          newY = resizeStart.positionY + deltaY;
          break;
        case 'right':
          newWidth = resizeStart.width + deltaX;
          break;
        case 'bottom':
          newHeight = resizeStart.height + deltaY;
          break;
        case 'left':
          newWidth = resizeStart.width - deltaX;
          newX = resizeStart.positionX + deltaX;
          break;
      }

      // Apply minimum size constraints
      const MIN_WIDTH = 100;
      const MIN_HEIGHT = 50;

      if (newWidth < MIN_WIDTH) {
        const diff = MIN_WIDTH - newWidth;
        newWidth = MIN_WIDTH;
        if (
          resizeType === 'bottom-left' ||
          resizeType === 'top-left' ||
          resizeType === 'left'
        ) {
          newX -= diff;
        }
      }

      if (newHeight < MIN_HEIGHT) {
        const diff = MIN_HEIGHT - newHeight;
        newHeight = MIN_HEIGHT;
        if (
          resizeType === 'top-left' ||
          resizeType === 'top-right' ||
          resizeType === 'top'
        ) {
          newY -= diff;
        }
      }

      // Ensure position is within bounds (minimum)
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      // Apply maximum size constraints based on canvas bounds
      const maxWidth = canvasWidthNormalized - newX;
      const maxHeight = canvasHeightNormalized - newY;

      if (newWidth > maxWidth) {
        const diff = newWidth - maxWidth;
        newWidth = maxWidth;
        // If resizing from left side, adjust position
        if (
          resizeType === 'bottom-left' ||
          resizeType === 'top-left' ||
          resizeType === 'left'
        ) {
          newX += diff;
        }
      }

      if (newHeight > maxHeight) {
        const diff = newHeight - maxHeight;
        newHeight = maxHeight;
        // If resizing from top side, adjust position
        if (
          resizeType === 'top-left' ||
          resizeType === 'top-right' ||
          resizeType === 'top'
        ) {
          newY += diff;
        }
      }

      // Final position bounds check (in case position was adjusted)
      newX = Math.max(0, Math.min(newX, canvasWidthNormalized - newWidth));
      newY = Math.max(0, Math.min(newY, canvasHeightNormalized - newHeight));

      // Ensure final size doesn't exceed canvas
      newWidth = Math.min(newWidth, canvasWidthNormalized - newX);
      newHeight = Math.min(newHeight, canvasHeightNormalized - newY);

      setCurrentSize({ width: newWidth, height: newHeight });
      setCurrentPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (onSizeChange) {
        const finalSize = sizeRef.current;
        const finalPosition = positionRef.current;
        onSizeChange(
          finalSize.width,
          finalSize.height,
          finalPosition.x !== resizeStart.positionX
            ? finalPosition.x
            : undefined,
          finalPosition.y !== resizeStart.positionY
            ? finalPosition.y
            : undefined
        );
      }
      setResizeType(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeType, resizeStart, onSizeChange, zoom]);

  const handleResizeStart = (e: React.MouseEvent, type: ResizeType) => {
    e.stopPropagation();
    if (!boxRef.current) return;

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: displaySize.width,
      height: displaySize.height,
      positionX: displayPosition.x,
      positionY: displayPosition.y,
    });
    setResizeType(type);
    setIsResizing(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on the remove button or resize handle
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.resize-handle')
    ) {
      return;
    }

    if (!boxRef.current) return;

    const boxRect = boxRef.current.getBoundingClientRect();

    // Calculate offset from mouse position to box top-left corner
    const offsetX = e.clientX - boxRect.left;
    const offsetY = e.clientY - boxRect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  if (Number(pageNumber) !== Number(currentPage)) {
    return null;
  }

  return (
    <Item
      ref={boxRef}
      variant={'outline'}
      className={cn(
        'absolute bg-muted border-2 border-primary rounded-lg pointer-events-auto p-2 gap-2',
        isDragging ? 'cursor-grabbing opacity-75' : 'cursor-move',
        isResizing && 'opacity-80'
      )}
      style={{
        left: `${displayPosition.x * zoom}px`,
        top: `${displayPosition.y * zoom}px`,
        width: `${displaySize.width * zoom}px`,
        height: `${displaySize.height * zoom}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ItemContent className='overflow-hidden items-center justify-center relative p-0'>
        {imageLoading ? (
          <Spinner className='size-6' />
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt='Signature'
            className='w-full h-full object-contain pointer-events-none'
          />
        ) : null}

        {/* Overlay info */}
        <div
          className={cn(
            'absolute inset-0 bg-background/60 flex flex-col items-center justify-center transition-opacity p-2 text-center',
            imageSrc && !isHovered && !isDragging && !isResizing
              ? 'opacity-0'
              : 'opacity-100'
          )}
        >
          <ItemTitle className='truncate block max-w-full text-xs'>
            {signerName || userId}
          </ItemTitle>
          <ItemDescription className='truncate block max-w-full text-[10px]'>
            {SignatureType[signatureType] || 'Không xác định'}
          </ItemDescription>
        </div>
      </ItemContent>

      <ItemActions className='absolute -top-2 -right-2 z-20'>
        <Button
          type='button'
          variant='destructive'
          size='icon-xs'
          className='rounded-full'
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <XIcon className='size-3' />
        </Button>
      </ItemActions>

      {/* Resize handles */}
      {(isHovered || isResizing) && (
        <>
          <div
            className={cn(
              'resize-handle absolute top-0 left-0 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nw-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(-50%, -50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          <div
            className={cn(
              'resize-handle absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ne-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(50%, -50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div
            className={cn(
              'resize-handle absolute bottom-0 left-0 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-sw-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(-50%, 50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div
            className={cn(
              'resize-handle absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-se-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(50%, 50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />
          {/* Edge handles */}
          <div
            className={cn(
              'resize-handle absolute top-0 left-1/2 w-8 h-2 bg-primary border-2 border-background rounded-sm cursor-n-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(-50%, -50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          />
          <div
            className={cn(
              'resize-handle absolute right-0 top-1/2 w-2 h-8 bg-primary border-2 border-background rounded-sm cursor-e-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(50%, -50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div
            className={cn(
              'resize-handle absolute bottom-0 left-1/2 w-8 h-2 bg-primary border-2 border-background rounded-sm cursor-s-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(-50%, 50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div
            className={cn(
              'resize-handle absolute left-0 top-1/2 w-2 h-8 bg-primary border-2 border-background rounded-sm cursor-w-resize',
              'hover:bg-primary/80 z-10'
            )}
            style={{ transform: 'translate(-50%, -50%)' }}
            onMouseDown={(e) => handleResizeStart(e, 'left')}
          />
        </>
      )}
    </Item>
  );
}
