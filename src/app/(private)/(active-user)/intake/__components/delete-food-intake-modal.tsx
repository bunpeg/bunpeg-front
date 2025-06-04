'use client';
import { useEffect } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Loader,
  RenderIf,
  useToast,
} from '@/ui';
import { api } from '@/trpc/react';

interface Props {
  itemId: number;
  day: Date;
  onClose: () => void;
}

export default function DeleteFoodIntakeModal(props: Props) {
  const { itemId, day, onClose } = props;

  const { toast } = useToast();
  const utils = api.useUtils();
  const { mutate: removeRecord, isPending } = api.intake.remove.useMutation({
    onSuccess: () => {
      void utils.intake.forDay.invalidate({ day });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete the food intake record',
        description: error.message,
        variant: 'destructive',
      })
    },
  });

  useEffect(() => {
    if (document.body) {
      document.body.style.pointerEvents = 'auto';
    }
  }, []);

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            If the food item you are about to remove was previously,{' '}
            then we are only showing it for a historic record purpose,{' '}
            if you <strong>remove</strong> it you will not be able to add it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => removeRecord({ id: itemId })}
          >
            <RenderIf condition={isPending}>
              <Loader color="white" size="xs" className="mr-2"/>
            </RenderIf>
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
