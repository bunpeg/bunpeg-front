'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { keepPreviousData } from '@tanstack/query-core';
import type { inferRouterOutputs } from '@trpc/server';
import { SaladIcon, SearchIcon, Trash2Icon } from 'lucide-react';

import { Button, DialogFooter, Input, InputWithLabel, Loader, Skeleton, useDebounce } from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';
import { calculateExchanges } from '@/utils/meal-intakes';

type Food = inferRouterOutputs<AppRouter>['food']['list'][0];

interface Props {
  meal: { id: number; name: string };
  day: Date;
  itemId?: number;
  initialValues?: FoodIntake;
}

const foodIntakeSchema = z.object({
  food_id: z.number().min(0, 'Please select a food item'),
  amount: z.number().min(0, 'Please enter an amount'),
});
type FoodIntake = z.infer<typeof foodIntakeSchema>;

export default function FoodIntakeForm(props: Props) {
  const { meal, day, initialValues, itemId } = props;

  const router = useRouter();

  const form = useForm<FoodIntake>({
    defaultValues: initialValues ?? {
      food_id: -1,
      amount: 0,
    },
    resolver: zodResolver(foodIntakeSchema),
  });

  const selectedFoodId = form.watch('food_id');

  const { debounceCall } = useDebounce(450);
  const [foodSearch, setFoodSearch] = useState<string>('');
  const { data: foods = [], isFetching: isFetchingFoods } = api.food.list.useQuery(
    { search: foodSearch, order: 'asc', list_on_search: true },
    { placeholderData: keepPreviousData },
  );
  const selectedFood = foods.find(food => selectedFoodId === food.id);

  const handleSearch = (value: string) => {
    if (value !== '' && value.length < 3) return;
    debounceCall(() => {
      setFoodSearch(value);
    });
  }

  const utils = api.useUtils();
  const { mutate: recordIntake, isPending: isCreating, error: createError } = api.intake.add.useMutation({
    onSuccess: () => {
      void utils.intake.forDay.invalidate({ day });
      router.push('/intake');
    },
  });
  const { mutate: updateRecord, isPending: isUpdating, error: updateError } = api.intake.update.useMutation({
    onSuccess: () => {
      void utils.intake.forDay.invalidate({ day });
      router.push('/intake');
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
    <>
      <form className="flex-1 flex flex-col gap-6" onSubmit={handleSubmit}>
        {!selectedFood ? (
          <>
            <div className="relative md:grow-0">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                defaultValue={foodSearch}
                onKeyDown={(e) => e.stopPropagation()}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white pl-8"
              />
            </div>
            {!foodSearch ? (
              <div className="flex flex-col items-center gap-2">
                <SaladIcon className="size-12 stroke-neutral-600" />
                <span className="text-center">
                  Start searching to find the food item you are looking for...
                </span>
              </div>
            ) : null}
            <ul className="flex flex-col gap-4">
              {foods.map((food) => (
                <li
                  key={food.id}
                  onClick={() => form.setValue('food_id', food.id)}
                  className="flex flex-col border rounded-sm py-2 px-4 cursor-pointer"
                >
                  <span>{food.name}</span>
                  <span className="text-muted-foreground text-sm">{craftFoodDetails(food)}</span>
                  <span className="text-muted-foreground">{food.description}</span>
                  <span className="text-muted-foreground text-sm">{food.notes}</span>
                </li>
              ))}
            </ul>
            {foodSearch && isFetchingFoods && foods.length === 0 ? (
              <>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col border rounded-sm py-2 px-2">
            <div className="flex justify-between items-center">
              <span>{selectedFood.name}</span>
              <Button
                size="xs"
                type="button"
                variant="ghost"
                onClick={() => {
                  form.setValue('food_id', -1);
                  setFoodSearch('');
                }}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
            <span className="text-muted-foreground text-sm">{craftFoodDetails(selectedFood)}</span>
            <span className="text-muted-foreground">{selectedFood.description}</span>
            <span className="text-muted-foreground text-sm">{selectedFood.notes}</span>
          </div>
        )}
        {selectedFood ? (
          <Controller
            name="amount"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-1">
                  <InputWithLabel
                    required
                    type="number"
                    label="Amount"
                    {...field}
                    value={field.value ?? 0}
                    error={form.formState.errors.amount?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="flex-1"
                    inputClassName="rounded-r-none text-right"
                  />
                  <div className="rounded-r-md flex items-center justify-center h-10 px-6 bg-neutral-100">
                    {selectedFood.unit}
                  </div>
                </div>
                <MealExchanges food={selectedFood} amount={field.value ?? 0} />
              </div>
            )}
          />
        ) : null}
        {errorMessage ? (
          <span className="text-red-500 text-sm font-medium">{errorMessage}</span>
        ) : null}
        <DialogFooter className="pt-6 mt-auto flex flex-col items-stretch">
          <Button size="lg" className="text-base" disabled={isPending || !selectedFood}>
            {isPending ? <Loader size="icon" color="white" className="mr-2" /> : null}
            {itemId ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function MealExchanges({ food, amount }: { food: Food; amount: number }) {
  if (!amount) return null;

  const { carbs, fats, proteins } = calculateExchanges({
    carbs: food.carbs,
    proteins:
    food.proteins,
    fats: food.fats,
    base_amount: food.amount,
    amount_consumed: amount,
  });

  return (
    <span>
      {amount} {food.unit} = C {carbs.toFixed(1)} | P {proteins.toFixed(1)} | F {fats.toFixed(1)}
    </span>
  );
}

function craftFoodDetails(food: Food | undefined) {
  if (!food) return undefined;

  const exchanges = `C: ${food.carbs} | P: ${food.proteins} | F: ${food.fats}`;

  if (food.unit === 'piece') {
    return `${food.amount} ${food.unit} = ${exchanges}`;
  }

  return `${food.amount}${food.unit} = ${exchanges}`;
}
