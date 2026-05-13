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
import { UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

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

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(
    null
  );

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
    (signer: User, signerIndex: number, position: ClickPosition) => {
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
      });
    },
    [signers, append, zoom]
  );

  const handleSignerSelect = (signer: User, signerIndex: number) => {
    if (!clickPosition) return;

    addSignature(signer, signerIndex, clickPosition);

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
    return watchedPositions.map((position, index) => {
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
          onRemove={() => remove(index)}
          currentPage={currentPage}
          onPositionChange={handlePositionChange(index)}
          onSizeChange={handleSizeChange(index)}
          zoom={zoom}
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
    zoom,
  ]);

  // Filter out signers who have already been added
  const availableSigners = useMemo(() => {
    const addedUserIds = new Set(watchedPositions.map((p) => p.userId));
    return signersWithUsers.filter(
      ({ user }) => user && !addedUserIds.has(user.id)
    );
  }, [signersWithUsers, watchedPositions]);

  return (
    <Form
      context={form}
      onSubmit={handleSubmit}
      className='flex flex-col gap-4'
    >
      <PdfViewer
        file={basicInformation?.contractFile}
        onPageClick={(event) => {
          const { page, ref: canvas } = event;
          if (!canvas) return;

          const rect = canvas.getBoundingClientRect();

          const width = rect.width;
          const height = rect.height;

          const positionX = event.clientX - rect.left;
          const positionY = event.clientY - rect.top;

          const position = {
            positionX,
            positionY,
            pageNumber: page,
            canvasWidth: width,
            canvasHeight: height,
          };

          if (availableSigners.length === 1) {
            const { user, signerIndex } = availableSigners[0];
            if (user) {
              addSignature(user, signerIndex, position);
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
              addSignature(user, signerIndex, position);
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
