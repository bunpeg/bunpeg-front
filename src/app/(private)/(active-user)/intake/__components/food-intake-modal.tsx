import { useState } from 'react';
import { z } from 'zod';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData } from '@tanstack/query-core';
import type { inferRouterOutputs } from '@trpc/server';
import { SearchIcon } from 'lucide-react';

import {
  Button, DelayRender,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  InputWithLabel,
  Label,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  useDebounce,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';

type Food = inferRouterOutputs<AppRouter>['food']['list'][0];

interface Props {
  meal: { id: number; name: string };
  day: Date;
  itemId?: number;
  initialValues?: FoodIntake;
  onClose: () => void;
}

const foodIntakeSchema = z.object({
  food_id: z.number().min(0, 'Please select a food item'),
  amount: z.number().min(0, 'Please enter an amount'),
});
type FoodIntake = z.infer<typeof foodIntakeSchema>;

export default function FoodIntakeModal(props: Props) {
  const { meal, day, initialValues, itemId, onClose } = props;

  const form = useForm<FoodIntake>({
    defaultValues: initialValues ?? {
      food_id: -1,
      amount: 0,
    },
    resolver: zodResolver(foodIntakeSchema),
  });

  const utils = api.useUtils();
  const { mutate: recordIntake, isPending: isCreating, error: createError } = api.intake.add.useMutation({
    onSuccess: () => {
      void utils.intake.forDay.invalidate({ day });
      onClose();
    },
  });
  const { mutate: updateRecord, isPending: isUpdating, error: updateError } = api.intake.update.useMutation({
    onSuccess: () => {
      void utils.intake.forDay.invalidate({ day });
      onClose();
    },
  });
  const isPending = isCreating || isUpdating;
  const errorMessage = createError?.message ?? updateError?.message;

  const handleSubmit = form.handleSubmit((values) => {
    if (itemId) {
      updateRecord({ intake_id: itemId, amount: values.amount, food_id: values.food_id });
    } else {
      recordIntake({ ...values, meal_id: meal.id, for_date: day });
    }
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent data-el="intake-modal" className="w-[500px] max-w-full min-h-96 h-screen md:h-auto md:max-h-[calc(100vh_-_5%)] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>
            What did you eat for {meal.name}?
          </DialogTitle>
        </DialogHeader>
        <form className="flex-1 flex flex-col gap-6 pt-6" onSubmit={handleSubmit}>
          <FormProvider {...form}>
            <DelayRender delay={0}>
              <FoodIntakeForm />
            </DelayRender>
          </FormProvider>
          {errorMessage ? (
            <span className="text-red-500 text-sm font-medium">{errorMessage}</span>
          ) : null}
          <DialogFooter className="pt-6 mt-auto">
            <Button className="px-8" disabled={isPending}>
              {isPending ? <Loader size="icon" color="white" className="mr-2" /> : null}
              {itemId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FoodIntakeForm() {
  const form = useFormContext<FoodIntake>();
  const selectedFoodId = form.watch('food_id');

  const { debounceCall } = useDebounce(450);
  const [foodSearch, setFoodSearch] = useState<string>('');
  const { data: foods = [], isFetching: isFetchingFoods } = api.food.list.useQuery(
    { search: foodSearch, order: 'asc' },
    { placeholderData: keepPreviousData },
  );
  const selectedFood = foods.find(food => selectedFoodId === food.id);

  const handleSearch = (value: string) => {
    if (value !== '' && value.length < 3) return;
    debounceCall(() => {
      setFoodSearch(value);
    });
  }

  return (
    <>
      <Controller
        name="food_id"
        control={form.control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <Label>Food item<sup className="ml-2">*</sup></Label>
            <Select
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                container={document.querySelector('[data-el="intake-modal"]') as HTMLElement}
                className="max-h-96 md:max-h-80 overflow-y-auto"
              >
                <div className="relative flex-1">
                  {isFetchingFoods
                    ? <Loader size="icon" className="absolute left-1.5 top-3.5" color="neutral" />
                    : <SearchIcon className="absolute left-1.5 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />}
                  <Input
                    type="search"
                    placeholder="Search..."
                    defaultValue={foodSearch}
                    onKeyDown={(e) => e.stopPropagation()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-none border-0 bg-white pl-8"
                  />
                </div>
                <SelectSeparator />
                {foods.map((food) => (
                  <SelectItem key={food.id} value={food.id.toString()}>{food.name}</SelectItem>
                ))}
                {!isFetchingFoods && foods.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No options available
                  </div>
                ) : null}
              </SelectContent>
            </Select>
          </div>
        )}
      />
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
            error={form.formState.errors.amount?.message}
            onChange={(e) => field.onChange(Number(e.target.value))}
            hint={craftFoodDetails(selectedFood)}
          />
        )}
      />
    </>
  );
}

function craftFoodDetails(food: Food | undefined) {
  if (!food) return undefined;

  const exchanges = `carbs: ${food.carbs} | proteins: ${food.proteins} | fats: ${food.fats}`;

  if (food.unit === 'piece') {
    return `${food.amount} ${food.unit} equals ${exchanges}`;
  }

  return `${food.amount}${food.unit} equals ${exchanges}`;
}
