import { useState } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalculatorIcon } from 'lucide-react';

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
  Label,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextareaWithLabel,
} from '@/ui';
import ExchangeCalculator from '@/app/(private)/(active-user)/groceries/__components/exchange-calculator';

const foodSchema = z.object({
  name: z.string().min(1, 'Please add a name'),
  description: z.string(),
  notes: z.string(),
  amount: z.number().min(1, 'Please add an amount'),
  unit: z.string().min(1, 'Please add a unit'),
  price: z.number(),
  carbs: z.number().min(0),
  proteins: z.number().min(0),
  fats: z.number().min(0),
});
export type FoodInput = z.infer<typeof foodSchema>;

interface Props {
  defaultValues: FoodInput;
  itemId?: number;
  isEditing?: boolean;
  onClose: () => void;
}

export default function FoodModal(props: Props) {
  const { defaultValues, isEditing = false, itemId, onClose } = props;

  const [showCalculator, setShowCalculator] = useState<boolean>(false);

  const form = useForm<FoodInput>({
    defaultValues,
    resolver: zodResolver(foodSchema),
  });

  const utils = api.useUtils();
  const { mutate: addFood, isPending: isAdding, error: createError } = api.food.add.useMutation({
    onSuccess: () => {
      void utils.food.list.invalidate();
      onClose();
    },
  });
  const { mutate: updateFood, isPending: isUpdating, error: updateError } = api.food.update.useMutation({
    onSuccess: () => {
      void utils.food.list.invalidate();
      onClose();
    },
  });
  const isPending = isAdding || isUpdating;
  const errorMessage = createError?.message ?? updateError?.message;

  const handleSubmit = form.handleSubmit((data) => {
    if (isEditing && itemId) {
      updateFood({ ...data, id: itemId });
    } else {
      addFood(data);
    }
  });

  const handleCalculatorSubmit = (goals: { grams: number; carbs: number; proteins: number; fats: number }) => {
    form.setValue('amount', goals.grams);
    form.setValue('carbs', goals.carbs);
    form.setValue('proteins', goals.proteins);
    form.setValue('fats', goals.fats);
    setShowCalculator(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[700px] max-w-full max-h-screen md:max-h-[calc(100vh_-_5%)] overflow-y-auto px-0 md:px-6 pb-0">
        <DialogHeader>
          <DialogTitle>Add food</DialogTitle>
          <DialogDescription>
            {isEditing ? (
              <>
                Updating the numeral values will affect the accounting for the days where this food item was used.
                <br />
                If you no no longer want to follow these values, we advice you remove this item and create a new one.
              </>
            ) : 'Add the details of the food so you can track it later on.'}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6 pt-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 px-4 md:px-0">
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
            <Controller
              name="description"
              control={form.control}
              render={({ field }) => (
                <InputWithLabel
                  label="Description"
                  {...field}
                  error={form.formState.errors.description?.message}
                />
              )}
            />
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <TextareaWithLabel
                  label="Notes"
                  {...field}
                  error={form.formState.errors.notes?.message}
                />
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="amount"
                control={form.control}
                render={({ field }) => (
                  <InputWithLabel
                    required
                    type="number"
                    label="Amount"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={form.formState.errors.amount?.message}
                  />
                )}
              />
              <Controller
                name="unit"
                control={form.control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label>Unit</Label>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">
                          <span className="hidden md:inline">grams (g)</span>
                          <span className="md:hidden">gs</span>
                        </SelectItem>
                        <SelectItem value="ml">
                          <span className="hidden md:inline">milliliters (ml)</span>
                          <span className="md:hidden">mls</span>
                        </SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <Controller
                name="price"
                control={form.control}
                render={({ field }) => (
                  <InputWithLabel
                    required
                    type="number"
                    label="Price"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={form.formState.errors.price?.message}
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="carbs"
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
                    error={!!formState.errors.carbs}
                  />
                )}
              />
              <Controller
                name="proteins"
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
                    error={!!formState.errors.proteins}
                  />
                )}
              />
              <Controller
                name="fats"
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
                    error={!!formState.errors.fats}
                  />
                )}
              />
            </div>
          </div>

          {showCalculator ? <ExchangeCalculator onSubmit={handleCalculatorSubmit}/> : null}

          {errorMessage ? (
            <span className="text-red-500 text-sm font-medium">{errorMessage}</span>
          ) : null}
          <DialogFooter className="py-6 px-4 md:px-0 sticky bottom-0 bg-white">
            <Button type="button" variant="link" className="mr-auto" onClick={() => setShowCalculator(!showCalculator)}>
              <CalculatorIcon className="h-4 w-4 mr-1" />
              {showCalculator ? 'Hide calculator' : 'Calculate exchanges'}
            </Button>
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
