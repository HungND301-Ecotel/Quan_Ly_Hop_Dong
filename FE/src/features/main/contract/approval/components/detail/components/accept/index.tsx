import { PdfViewer } from '@/components/pdf-viewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { ContractAction } from '@/constants/contract-action';
import { useAuthContext } from '@/features/context';
import { SignBox } from '@/features/main/contract/edit/sign-postions/sign-box';
import { cn } from '@/lib/utils';
import { contractService } from '@/services/contract';
import { Contract } from '@/services/contract/type';
import { fileService } from '@/services/file';
import { CheckIcon, CircleAlert, FileCheckIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type ContractAcceptProps = {
  contract?: Contract;
  onSubmit?: () => Promise<void> | void;
};

type Step = 'confirm' | 'signing' | 'preview';

export function ContractAccept({ contract, onSubmit }: ContractAcceptProps) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('confirm');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<{
    positionX: number;
    positionY: number;
    pageNumber: number;
    width: number;
    height: number;
  }>();
  const [file, setFile] = useState<File>();
  const [signedFile, setSignedFile] = useState<File>();
  const [submiting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!contract) return;
    const contractFile = contract.signedFilePath || contract.filePath;
    fileService.getFile(contractFile).then((f) => setFile(f));
  }, [contract]);

  const userFlow = useMemo(() => {
    return contract?.signingFlows?.find(
      (f) => f.userId === user?.id && f.status !== 'PENDING'
    );
  }, [contract, user]);

  const needsPosition = useMemo(() => {
    if (!userFlow) return false;
    return !userFlow.positionX && !userFlow.positionY;
  }, [userFlow]);

  // Bước hiện tại thực tế: nếu needsPosition thì bắt đầu ở 'signing', không thì 'confirm'
  const resolvedStep: Step = step === 'confirm' && needsPosition ? 'signing' : step;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setPosition(undefined);
      setCurrentPage(1);
      setSignedFile(undefined);
      setStep('confirm');
    }
  };

  const handleSubmit = async () => {
    if (!contract || !userFlow) return;

    if (resolvedStep === 'signing' && !position) {
      toast.error('Vui lòng chọn vị trí ký trên tài liệu');
      return;
    }

    try {
      setSubmitting(true);

      await contractService.approveContract({
        contractId: contract.id,
        action: ContractAction.Approve,
        signatureId:
          user?.signatures.find(
            (s) => s.signatureType === userFlow.signatureType
          )?.id || '',
        signingFlowPositions: position || undefined,
      });

      toast.success(
        `Phê duyệt hợp đồng ${contract.contractNumber.toUpperCase()} thành công`
      );

      // Fetch file đã ký để preview — gọi onSubmit SAU khi user đóng preview
      const detail = await contractService.getContractDetail(contract.id);
      const signedPath = detail?.signedFilePath || detail?.filePath;
      if (signedPath) {
        const signed = await fileService.getFile(signedPath);
        setSignedFile(signed);
        setStep('preview'); // ✅ chuyển sang preview, KHÔNG đóng dialog
      } else {
        // Không có file thì đóng luôn
        onSubmit?.();
        handleOpenChange(false);
      }
    } catch {
      toast.error('Phê duyệt hợp đồng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePreview = () => {
    handleOpenChange(false);
    onSubmit?.(); // ✅ refresh bên ngoài SAU khi user chủ động đóng preview
  };

  if (!contract) return null;

  const isExpanded = resolvedStep === 'signing' || resolvedStep === 'preview';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={'default'} size={'lg'}>
          <FileCheckIcon />
          <span>Phê duyệt</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex flex-col gap-0 duration-200',
          isExpanded
            ? 'w-full md:min-w-xl lg:min-w-4xl h-[calc(100vh-4rem)] p-0'
            : ''
        )}
      >
        <DialogHeader className={cn('gap-1', isExpanded && 'p-6 pb-2')}>
          <DialogTitle className='flex items-center gap-2'>
            <span className='text-lg font-semibold'>
              Phê duyệt và ký hợp đồng {contract.contractNumber.toUpperCase()}
            </span>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* ── STEP: preview sau khi ký ── */}
        {resolvedStep === 'preview' && signedFile && (
          <div className='flex-1 overflow-hidden flex flex-col'>
            <div className='bg-green-50 border-y border-green-200 px-6 py-2 flex items-center gap-3'>
              <CheckIcon className='text-green-600 size-5 shrink-0' />
              <p className='text-sm text-green-800 font-medium'>
                Hợp đồng đã được ký thành công. Dưới đây là bản hợp đồng có chữ ký của bạn.
              </p>
            </div>
            <div className='flex-1 overflow-auto p-6'>
              <PdfViewer
                file={signedFile}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            </div>
          </div>
        )}

        {/* ── STEP: chọn vị trí ký ── */}
        {resolvedStep === 'signing' && (
          <div className='flex-1 overflow-hidden flex flex-col'>
            <div className='bg-amber-50 border-y border-amber-200 px-6 py-2 flex items-center gap-3'>
              <CircleAlert className='text-amber-600 size-5 shrink-0' />
              <p className='text-sm text-amber-800 font-medium'>
                Vui lòng chọn vị trí ký trên hợp đồng.
              </p>
            </div>
            <div className='flex-1 overflow-auto p-6'>
              {file && (
                <PdfViewer
                  file={file}
                  onPageClick={(event) => {
                    if (position) return;
                    const { page, ref: canvas } = event;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    setPosition({
                      positionX: (event.clientX - rect.left) / zoom,
                      positionY: (event.clientY - rect.top) / zoom,
                      pageNumber: page,
                      width: 200 / zoom,
                      height: 80 / zoom,
                    });
                  }}
                  onSignButtonClick={(clickPos) => {
                    if (position) return;
                    setPosition({
                      positionX: clickPos.positionX / zoom,
                      positionY: clickPos.positionY / zoom,
                      pageNumber: clickPos.pageNumber,
                      width: 200 / zoom,
                      height: 80 / zoom,
                    });
                  }}
                  signBoxes={
                    position && user && userFlow ? (
                      <SignBox
                        userId={user.id}
                        signatureType={Number(userFlow.signatureType)}
                        signerName={user.fullname}
                        positionX={position.positionX}
                        positionY={position.positionY}
                        pageNumber={position.pageNumber}
                        width={position.width}
                        height={position.height}
                        currentPage={currentPage}
                        onRemove={() => setPosition(undefined)}
                        onPositionChange={(x, y) =>
                          setPosition((p) => p && { ...p, positionX: x, positionY: y })
                        }
                        onSizeChange={(w, h, x, y) =>
                          setPosition(
                            (p) =>
                              p && {
                                ...p,
                                width: w,
                                height: h,
                                ...(x !== undefined && { positionX: x }),
                                ...(y !== undefined && { positionY: y }),
                              }
                          )
                        }
                        zoom={zoom}
                      />
                    ) : null
                  }
                  onPageChange={setCurrentPage}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  currentPage={currentPage}
                />
              )}
            </div>
          </div>
        )}

        {/* ── STEP: confirm (không cần chọn vị trí) ── */}
        {resolvedStep === 'confirm' && (
          <div className='p-6 pt-2'>
            <Item variant={'muted'} className='bg-amber-50 border-amber-200'>
              <ItemMedia variant={'icon'}>
                <CircleAlert className='text-amber-600 size-5' />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-amber-800 font-bold'>Lưu ý</ItemTitle>
                <ItemDescription className='text-amber-800'>
                  Sau khi xác nhận, chữ ký điện tử của bạn sẽ được thêm vào hợp
                  đồng và không thể hoàn tác.
                </ItemDescription>
              </ItemContent>
            </Item>
          </div>
        )}

        <DialogFooter className={cn('gap-2', isExpanded && 'p-6 pt-2 border-t')}>
          {resolvedStep === 'preview' ? (
            // Sau khi ký xong: chỉ nút Đóng
            <Button variant={'default'} size={'lg'} className='px-4' onClick={handleClosePreview}>
              <CheckIcon />
              <span>Đóng</span>
            </Button>
          ) : (
            <>
              <DialogClose asChild>
                <Button variant={'outline'} size={'lg'} className='px-4'>
                  <XIcon />
                  <span>Hủy</span>
                </Button>
              </DialogClose>
              <Button
                size={'lg'}
                variant={'default'}
                className='px-4'
                onClick={handleSubmit}
                disabled={submiting}
              >
                <CheckIcon />
                {submiting ? <Spinner /> : 'Phê duyệt'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}