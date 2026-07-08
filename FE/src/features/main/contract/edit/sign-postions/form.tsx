import { Form } from '@/components/form/form';
import { PdfViewer } from '@/components/pdf-viewer';
import { StepperPrev } from '@/components/stepper';
import { useStepperContext } from '@/components/stepper/context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { useContractEditContext } from '@/features/main/contract/edit/context';
import {
  SignPositionsSchema,
  SignPositionsValues,
} from '@/features/main/contract/edit/sign-postions/schema';
import { SignBox } from '@/features/main/contract/edit/sign-postions/sign-box';
import { userService } from '@/services/user';
import { User } from '@/types/user.type';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Paperclip, UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FileCombobox } from '@/components/ui/fileCombobox';

type ClickPosition = {
  positionX: number;
  positionY: number;
  pageNumber: number;
  canvasWidth: number;
  canvasHeight: number;
};

export function ContractSignPostionsForm() {
  const {
    basicInformation,
    signFlows: signers,
    signPositions,
    setSignPositions,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
  } = useContractEditContext();
  const { next } = useStepperContext();

  // Gộp 2 nguồn file thành 1 danh sách duy nhất với fileIndex toàn cục liên tục
  // contractFile đứng trước, attachmentFiles nối tiếp theo sau
  const contractFiles = Array.isArray(basicInformation?.contractFile)
    ? basicInformation.contractFile
    : basicInformation?.contractFile
      ? [basicInformation.contractFile]
      : [];

  const attachmentFiles = Array.isArray(basicInformation?.attachmentFiles)
    ? basicInformation.attachmentFiles
    : basicInformation?.attachmentFiles
      ? [basicInformation.attachmentFiles]
      : [];

  // allFiles[i].fileIndex chính là index toàn cục dùng để lưu vào position.fileIndex
  const allFiles = useMemo(() => {
    return [
      ...contractFiles.map((file, idx) => ({
        file,
        fileIndex: idx,
        group: 'contract' as const,
      })),
      ...attachmentFiles.map((file, idx) => ({
        file,
        fileIndex: contractFiles.length + idx,
        group: 'attachment' as const,
      })),
    ];
  }, [contractFiles, attachmentFiles]);

  const [open, setOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );
  const selectedFile = allFiles.find((f) => f.fileIndex === selectedFileIndex);

  useEffect(() => {
    const promises = Promise.all([userService.getUserList()]);

    promises.then(([users]) => {
      setUsers(users || []);
    });
  }, []);

  const form = useForm<SignPositionsValues>({
    resolver: zodResolver(SignPositionsSchema),
    mode: 'onSubmit',
    defaultValues: signPositions || {
      postions: [],
    },
  });

  useEffect(() => {
    if (signPositions) {
      form.reset(signPositions);
    }
  }, [signPositions, form]);

  const { append, remove, update, fields } = useFieldArray({
    control: form.control,
    name: 'postions',
  });

  const watchedPositions = form.watch('postions');

  const handleSubmit = (values: SignPositionsValues) => {
    setSignPositions(values);
    next();
  };

  const addSignature = useCallback(
    (
      signer: User,
      signerIndex: number,
      position: ClickPosition,
      fileIndex: number
    ) => {
      if (!signers) return;

      // Find the signer in the signers array to get signTypeId
      const signerData = signers.signers[signerIndex];
      if (!signerData) return;

      // Convert signTypeId to signatureType (number)
      const signatureType = Number(signerData.signTypeId);

      // Default dimensions
      const width = 200;
      const height = 80;

      // Append new position
      append({
        userId: signer.id,
        sequenceOrder: signerIndex + 1,
        signatureType,
        positionX: position.positionX / zoom,
        positionY: position.positionY / zoom,
        pageNumber: position.pageNumber,
        width: width / zoom,
        height: height / zoom,
        fileIndex,
      });
    },
    [signers, append, zoom]
  );

  const handleSignerSelect = (signer: User, signerIndex: number) => {
    if (!clickPosition) return;

    addSignature(signer, signerIndex, clickPosition, selectedFileIndex);

    // Close dialog and reset click position
    setOpen(false);
    setClickPosition(null);
  };

  const handlePositionChange = useCallback(
    (index: number) => (newX: number, newY: number) => {
      const currentPosition = watchedPositions[index];
      if (!currentPosition) return;

      update(index, {
        ...currentPosition,
        positionX: newX,
        positionY: newY,
      });
    },
    [watchedPositions, update]
  );

  const handleSizeChange = useCallback(
    (index: number) =>
      (newWidth: number, newHeight: number, newX?: number, newY?: number) => {
        const currentPosition = watchedPositions[index];
        if (!currentPosition) return;

        update(index, {
          ...currentPosition,
          width: newWidth,
          height: newHeight,
          ...(newX !== undefined && { positionX: newX }),
          ...(newY !== undefined && { positionY: newY }),
        });
      },
    [watchedPositions, update]
  );

  // Get signers with user data
  const signersWithUsers = useMemo(() => {
    return (
      signers?.signers.map((signer, index) => ({
        user: users.find((u) => u.id === signer.signerId),
        signerIndex: index,
        signerData: signer,
      })) || []
    );
  }, [signers, users]);

  // Render sign-boxes for current page
  const signBoxes = useMemo(() => {
    return watchedPositions
      .map((position, index) => ({ position, index })) // giữ index gốc
      .filter(({ position }) => (position.fileIndex ?? 0) === selectedFileIndex)
      .map(({ position, index }) => {
        // index ở đây là index gốc trong watchedPositions
        const user = users.find((u) => u.id === position.userId);
        const signatureFile = user?.signatures.find(
          (s) => s.signatureType === position.signatureType
        )?.signatureFile;

        return (
          <SignBox
            key={fields[index]?.id || index}
            positionX={position.positionX}
            positionY={position.positionY}
            pageNumber={position.pageNumber}
            userId={position.userId}
            signatureType={position.signatureType}
            signatureFile={signatureFile}
            width={position.width}
            height={position.height}
            signerName={user?.fullname}
            onRemove={() => remove(index)} // index gốc → đúng
            currentPage={currentPage}
            onPositionChange={handlePositionChange(index)} // index gốc → đúng
            onSizeChange={handleSizeChange(index)} // index gốc → đúng
            zoom={zoom}
          />
        );
      });
  }, [
    watchedPositions,
    users,
    fields,
    currentPage,
    selectedFileIndex,
    remove,
    handlePositionChange,
    handleSizeChange,
    zoom,
  ]);

  // Filter out signers who have already been added
  const availableSigners = useMemo(() => {
    const addedUserIds = new Set(
      watchedPositions
        .filter((p) => (p.fileIndex ?? 0) === selectedFileIndex)
        .map((p) => p.userId)
    );
    return signersWithUsers.filter(
      ({ user }) => user && !addedUserIds.has(user.id)
    );
  }, [signersWithUsers, watchedPositions, selectedFileIndex]);

  return (
    <Form
      context={form}
      onSubmit={handleSubmit}
      className='flex flex-col gap-4'
    >
      {allFiles.length > 1 && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm'>
          {contractFiles.length > 0 && (
            <FileCombobox
              icon={<FileText className='h-4 w-4 text-primary' />}
              label='Hợp đồng'
              placeholder='Chọn hợp đồng'
              files={allFiles.filter((f) => f.group === 'contract')}
              selectedIndex={
                allFiles[selectedFileIndex]?.group === 'contract'
                  ? selectedFileIndex
                  : -1
              }
              onSelect={(index) => {
                setSelectedFileIndex(index);
                setCurrentPage(1);
              }}
            />
          )}

          {attachmentFiles.length > 0 && (
            <FileCombobox
              icon={<Paperclip className='h-4 w-4 text-primary' />}
              label='Phụ lục hợp đồng và tài liệu khác'
              placeholder='Chọn phụ lục hợp đồng và tài liệu khác'
              files={allFiles.filter((f) => f.group === 'attachment')}
              selectedIndex={
                allFiles[selectedFileIndex]?.group === 'attachment'
                  ? selectedFileIndex
                  : -1
              }
              onSelect={(index) => {
                setSelectedFileIndex(index);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      )}

      <PdfViewer
        file={selectedFile?.file}
        onPageClick={(event) => {
          const { page, ref: canvas } = event;
          if (!canvas) return;

          const rect = canvas.getBoundingClientRect();
          const position = {
            positionX: event.clientX - rect.left,
            positionY: event.clientY - rect.top,
            pageNumber: page,
            canvasWidth: rect.width,
            canvasHeight: rect.height,
          };

          if (availableSigners.length === 1) {
            const { user, signerIndex } = availableSigners[0];
            if (user) {
              addSignature(user, signerIndex, position, selectedFileIndex); // <-- thêm
              return;
            }
          }

          setClickPosition(position);
          setCurrentPage(page);
          setOpen(true);
        }}
        signBoxes={signBoxes}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSignButtonClick={(position) => {
          if (availableSigners.length === 1) {
            const { user, signerIndex } = availableSigners[0];
            if (user) {
              addSignature(user, signerIndex, position, selectedFileIndex); // <-- thêm
              return;
            }
          }
          setClickPosition(position);
          setOpen(true);
        }}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <SignersDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setClickPosition(null);
          }
        }}
        signersWithData={availableSigners}
        onSignerSelect={handleSignerSelect}
      />

      <div className='fixed bottom-0 start-0 p-6 py-4 shadow bg-background w-full border-t flex items-center justify-between'>
        <StepperPrev>Quay lại</StepperPrev>
        <div className='mx-auto hidden md:block' />
        <Button
          type='submit'
          size={'lg'}
          className='px-4 w-24'
          onClick={() => {
            console.log(form.formState.errors);
          }}
        >
          Tiếp tục
        </Button>
      </div>
    </Form>
  );
}

type SignersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signersWithData: Array<{
    user: User | undefined;
    signerIndex: number;
    signerData: {
      signerId: string;
      signTypeId: string;
    };
  }>;
  onSignerSelect: (signer: User, signerIndex: number) => void;
};

export function SignersDialog({
  open,
  onOpenChange,
  signersWithData,
  onSignerSelect,
}: SignersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn người ký</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className='space-y-3'>
          {signersWithData.length > 0 ? (
            signersWithData?.map(({ user, signerIndex }) => {
              if (!user) return null;

              return (
                <Item
                  key={user.id}
                  variant={'outline'}
                  className='cursor-pointer hover:bg-accent'
                  onClick={() => {
                    onSignerSelect(user, signerIndex);
                  }}
                >
                  <ItemContent>
                    <ItemTitle>{user.fullname}</ItemTitle>
                    <ItemDescription>{user.email}</ItemDescription>
                  </ItemContent>
                </Item>
              );
            })
          ) : (
            <Empty className='border-0 p-8'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>Hết người ký khả dụng</EmptyTitle>
                <EmptyDescription>
                  Tất cả người ký trong danh sách đã được thêm vào hợp đồng.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
