'use client';
import { useEffect } from 'react';
import type { inferRouterOutputs } from '@trpc/server';

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
  RenderIf, useToast,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';

type Food = inferRouterOutputs<AppRouter>['food']['list'][0];

interface Props {
  food: Food;
  onClose: () => void;
}

export default function DeleteFoodModal(props: Props) {
  const { food, onClose } = props;

  const { toast } = useToast();
  const utils = api.useUtils();
  const { mutate: removeFood, isPending } = api.food.remove.useMutation({
    onSuccess: () => {
      void utils.food.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete the food item',
        description: error.message
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
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            The <strong>"{food.name}"</strong> item will not be deleted as it might have been used already,
            but you will not be able to use it in the future.
            If you used it to record a meal intake you will see it there,
            but it will not show up as a option when adding new records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => removeFood({ id: food.id })}
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
