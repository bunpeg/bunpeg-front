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

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];

interface Props {
  meal: Meal;
  onClose: () => void;
}

export default function DeleteMealModal(props: Props) {
  const { meal, onClose } = props;

  const { toast } = useToast();
  const utils = api.useUtils();
  const { mutate: removeMeal, isPending } = api.meals.remove.useMutation({
    onSuccess: () => {
      void utils.meals.list.invalidate();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete the meal item',
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
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            The <strong>"{meal.name}"</strong> item will not be deleted as it might have been used already,
            but you will not be able to use it in the future.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => removeMeal({ id: meal.id })}
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
