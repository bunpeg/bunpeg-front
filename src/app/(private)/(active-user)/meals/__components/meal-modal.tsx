import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { api } from '@/trpc/react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputWithLabel,
  Loader,
} from '@/ui';

const mealSchema = z.object({
  name: z.string(),
  carbs_goal: z.number().min(0),
  proteins_goal: z.number().min(0),
  fats_goal: z.number().min(0),
});
export type MealInput = z.infer<typeof mealSchema>;

interface Props {
  defaultValues: MealInput;
  itemId?: number;
  isEditing?: boolean;
  onClose: () => void;
}

export default function MealModal(props: Props) {
  const { defaultValues, isEditing = false, itemId, onClose } = props;

  const form = useForm<MealInput>({
    defaultValues,
    resolver: zodResolver(mealSchema),
  });

  const utils = api.useUtils();
  const { mutate: addMeal, isPending: isAdding, error: createError } = api.meals.add.useMutation({
    onSuccess: () => {
      void utils.meals.list.invalidate();
      onClose();
    },
  });
  const { mutate: updateMeal, isPending: isUpdating, error: updateError } = api.meals.update.useMutation({
    onSuccess: () => {
      void utils.meals.list.invalidate();
      onClose();
    },
  });
  const isPending = isAdding || isUpdating;
  const errorMessage = createError?.message ?? updateError?.message;

  const handleSubmit = form.handleSubmit((data) => {
    if (isEditing && itemId) {
      updateMeal({ ...data, id: itemId });
    } else {
      addMeal(data);
    }
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[500px] max-w-full">
        <DialogHeader>
          <DialogTitle>Add meal</DialogTitle>
          <DialogDescription>
            {isEditing
              ? (
                <>
                  Updating the exchange goals will affect the accounting for the days where this meal was used.
                  <br />
                  If you no no longer want to follow these values, we advice you remove this meal and create a new one.
                </>
              )
              : 'Add the details of the meal so you can track it later on.'}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6 pt-6" onSubmit={handleSubmit}>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <InputWithLabel
                required
                label="Name"
                {...field}
                error={form.formState.errors.name?.message}
              />
            )}
          />
          <div className="grid grid-cols-3 gap-4">
            <Controller
              name="carbs_goal"
              control={form.control}
              render={({ field, formState }) => (
                <InputWithLabel
                  required
                  label="Carbs"
                  type="number"
                  step={0.01}
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.carbs_goal}
                />
              )}
            />
            <Controller
              name="proteins_goal"
              control={form.control}
              render={({ field, formState }) => (
                <InputWithLabel
                  required
                  label="Proteins"
                  type="number"
                  step={0.01}
                  min={0}
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.proteins_goal}
                />
              )}
            />
            <Controller
              name="fats_goal"
              control={form.control}
              render={({ field, formState }) => (
                <InputWithLabel
                  required
                  label="Fats"
                  type="number"
                  step={0.01}
                  min={0}
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!formState.errors.fats_goal}
                />
              )}
            />
          </div>
          {errorMessage ? (
            <span className="text-red-500 text-sm font-medium">{errorMessage}</span>
          ) : null}
          <DialogFooter className="pt-6">
            <Button className="px-6" disabled={isPending}>
              {isPending ? <Loader color="white" size="icon" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
