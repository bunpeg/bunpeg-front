'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Code,
  InputWithLabel,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui';
import { api } from '@/trpc/react';

const mealsSchema = z.object({
  name: z.string(),
  carbs: z.number().min(0),
  proteins: z.number().min(0),
  fats: z.number().min(0),
});

type Meal = z.infer<typeof mealsSchema>;

export default function OnboardingPage() {
  const form = useForm<Meal>({
    defaultValues: {
      name: '',
      carbs: 0,
      proteins: 0,
      fats: 0,
    },
    resolver: zodResolver(mealsSchema),
  });

  const [meals, setMeals] = useState<Meal[]>([]);

  const { data: session, update } = useSession();
  const router = useRouter();
  const { mutateAsync: initUser, isPending, error, } = api.setup.init.useMutation();

  const handleAddMeal = form.handleSubmit((data: Meal) => {
    setMeals(meals.concat(data));
    form.reset();
    const nameInput = document.querySelector('[data-el="meal-name"]');
    if (nameInput) {
      (nameInput as HTMLElement).focus();
    }
  });

  const handleSetupUser = async () => {
    await initUser({ meals });
    await update({ ...session, user: { ...session!.user, isSetup: true } });
    router.push('/intake');
  };

  return (
    <Card>
      <CardHeader className="space-y-0 grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-20">
        <div className="flex flex-col gap-2">
          <CardTitle>
            Welcome
          </CardTitle>
          <CardDescription className="leading-6">
            First things first, we need to set you up, add below how many meals do you want to track.
            <br />
            Eg: Breakfast, Lunch, Dinner...
            <br />
            When you are done, go to the bottom of the page and click the{' '}
            <Code className="text-primary font-bold">Continue</Code> button.
          </CardDescription>
        </div>
        <form onSubmit={handleAddMeal}>
          <div className="flex flex-col gap-6">
            <h3 className="font-medium">Add new meal</h3>
            <div className="flex items-end gap-4">
              <Controller
                name="name"
                disabled={isPending}
                control={form.control}
                render={({ field, formState }) => (
                  <InputWithLabel required label="Name" data-el="meal-name" {...field} error={!!formState.errors.name} />
                )}
              />
              <Controller
                name="carbs"
                disabled={isPending}
                control={form.control}
                render={({ field, formState }) => (
                  <InputWithLabel required label="Carbs" className="w-20" type="number" step={0.1} min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} error={!!formState.errors.carbs} />
                )}
              />
              <Controller
                name="proteins"
                disabled={isPending}
                control={form.control}
                render={({ field, formState }) => (
                  <InputWithLabel required label="Proteins" className="w-28" type="number" step={0.1} min={0} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} error={!!formState.errors.proteins} />
                )}
              />
              <Controller
                name="fats"
                disabled={isPending}
                control={form.control}
                render={({ field, formState }) => (
                  <InputWithLabel required  label="Fats" className="w-20" type="number" step={0.1} min={0} {...field} value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} error={!!formState.errors.fats} />
                )}
              />
              <Button variant="black" disabled={isPending}>Add meal</Button>
            </div>
          </div>
        </form>
      </CardHeader>
      <CardContent className="flex flex-col py-10 gap-20">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center">Carbs</TableHead>
              <TableHead className="w-28 text-center">Proteins</TableHead>
              <TableHead className="w-28 text-center">Fats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meals.map((meal, index) => (
              <TableRow key={index}>
                <TableCell>{meal.name}</TableCell>
                <TableCell className="w-28 text-center">{meal.carbs}</TableCell>
                <TableCell className="w-28 text-center">{meal.proteins}</TableCell>
                <TableCell className="w-28 text-center">{meal.fats}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col items-center gap-4">
          <Button className="px-10 py-3" onClick={handleSetupUser} disabled={isPending}>
            {isPending ? <Loader color="white" size="icon" className="mr-2" /> : null}
            Continue
          </Button>
          {error ? (
            <span className="text-red">{error.message}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
