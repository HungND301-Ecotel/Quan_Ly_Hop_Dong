import { PdfViewer } from '@/components/pdf-viewer';
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
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { SignBox } from '@/features/main/contract/edit/sign-postions/sign-box';
import { ContractSignFlow } from '@/services/contract/type';
import { User } from '@/types/user.type';
import { UsersIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  ArrayPath,
  Control,
  FieldValues,
  Path,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

type ClickPosition = {
  positionX: number;
  positionY: number;
  pageNumber: number;
  canvasWidth: number;
  canvasHeight: number;
};

export type FormSignsProps<T extends FieldValues> = {
  control: Control<T>;
  name: ArrayPath<T>;
  pdfFile?: File;
  signers?: {
    signers: Array<{
      signerId: string;
      signTypeId: string;
    }>;
  };
  users: User[];
};

export function FormSigns<T extends FieldValues>({
  control,
  name,
  pdfFile,
  signers,
  users,
}: FormSignsProps<T>) {
  const [open, setOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const { append, remove, update, fields } = useFieldArray({
    control,
    name,
  });

  const { watch } = useFormContext<T>();
  const watchedValue = watch(name as unknown as Path<T>);
  const watchedPositions = useMemo(
    () =>
      (Array.isArray(watchedValue)
        ? (watchedValue as unknown as ContractSignFlow[])
        : []) as ContractSignFlow[],
    [watchedValue]
  );

  const handleSignerSelect = (signer: User, signerIndex: number) => {
    if (!clickPosition || !signers) return;

    const signerData = signers.signers[signerIndex];
    if (!signerData) return;

    const signatureType = Number(signerData.signTypeId);
    const width = 200;
    const height = 80;

    append({
      userId: signer.id,
      sequenceOrder: signerIndex + 1,
      signatureType,
      positionX: clickPosition.positionX,
      positionY: clickPosition.positionY,
      pageNumber: clickPosition.pageNumber,
      width,
      height,
    } as unknown as Parameters<typeof append>[0]);

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
      } as unknown as Parameters<typeof update>[1]);
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
        } as unknown as Parameters<typeof update>[1]);
      },
    [watchedPositions, update]
  );

  const signersWithUsers = useMemo(() => {
    return (
      signers?.signers.map((signer, index) => ({
        user: users.find((u) => u.id === signer.signerId),
        signerIndex: index,
        signerData: signer,
      })) || []
    );
  }, [signers, users]);

  const signBoxes = useMemo(() => {
    return watchedPositions.map((position, index) => {
      const user = users.find((u) => u.id === position.userId);
      return (
        <SignBox
          key={fields[index]?.id || index}
          positionX={position.positionX!}
          positionY={position.positionY!}
          pageNumber={position.pageNumber!}
          userId={position.userId!}
          signatureType={position.signatureType!}
          width={position.width!}
          height={position.height!}
          signerName={user?.fullname}
          onRemove={() => remove(index)}
          currentPage={currentPage}
          onPositionChange={handlePositionChange(index)}
          onSizeChange={handleSizeChange(index)}
        />
      );
    });
  }, [
    watchedPositions,
    users,
    fields,
    currentPage,
    remove,
    handlePositionChange,
    handleSizeChange,
  ]);

  const availableSigners = useMemo(() => {
    const addedUserIds = new Set(watchedPositions.map((p) => p.userId));
    return signersWithUsers.filter(
      ({ user }) => user && !addedUserIds.has(user.id)
    );
  }, [signersWithUsers, watchedPositions]);

  return (
    <>
      <PdfViewer
        file={pdfFile}
        onPageClick={(event) => {
          const { page, ref: canvas } = event;
          if (!canvas) return;

          const rect = canvas.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;
          const positionX = event.clientX - rect.left;
          const positionY = event.clientY - rect.top;

          setClickPosition({
            positionX,
            positionY,
            pageNumber: page,
            canvasWidth: width,
            canvasHeight: height,
          });
          setCurrentPage(page);
          setOpen(true);
        }}
        signBoxes={signBoxes}
        onPageChange={setCurrentPage}
      />

      <SignersDialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) setClickPosition(null);
        }}
        signersWithData={availableSigners}
        onSignerSelect={handleSignerSelect}
      />
    </>
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

function SignersDialog({
  open,
  onOpenChange,
  signersWithData,
  onSignerSelect,
}: SignersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-lg'>Chọn thành phần ký</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className='space-y-3'>
          {signersWithData.length > 0 ? (
            signersWithData.map(({ user, signerIndex }) => {
              if (!user) return null;

              return (
                <Item
                  key={user.id}
                  variant={'outline'}
                  className='cursor-pointer hover:bg-accent rounded-none bg-accent border-s-4 border-s-primary'
                  onClick={() => {
                    onSignerSelect(user, signerIndex);
                  }}
                >
                  <ItemMedia variant={'icon'}>
                    <div className='flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground'>
                      <span>{signerIndex + 1}</span>
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{user.fullname}</ItemTitle>
                    <ItemDescription>{user.positionName}</ItemDescription>
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
                <EmptyTitle>Không có thành phần ký khả dụng</EmptyTitle>
                <EmptyDescription>
                  Tất cả thành phần ký đã được thêm vào hợp đồng.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
