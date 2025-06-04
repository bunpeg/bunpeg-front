'use client';
import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronsDownIcon,
  ChevronsUpIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  PencilLineIcon,
  Trash2Icon,
} from 'lucide-react';
import type { inferRouterOutputs } from '@trpc/server';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';
import AddMeal from './__components/add-meal';
import MealModal from './__components/meal-modal';
import DeleteMealModal from './__components/delete-meal-modal';

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];
export default function MealsPage() {
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);

  const { data: meals = [], isLoading, refetch } = api.meals.list.useQuery();
  const { mutate: reorder, isPending: isReordering } = api.meals.updateOrder.useMutation({
    onSuccess: () => refetch(),
  });

  const handleReorder = (id: number, dir: 'top' | 'up' | 'down' | 'bottom') => {
    const fromIndex = meals.findIndex(meal => meal.id === id);
    let toIndex: number | null = null;

    if (dir === 'top') {
      toIndex = 0;
    }
    if (dir === 'up') {
      toIndex = fromIndex - 1;
    }
    if (dir === 'down') {
      toIndex = fromIndex + 1;
    }
    if (dir === 'bottom') {
      toIndex = meals.length - 1;
    }

    if (toIndex !== null) {
      const from = meals[fromIndex]!;
      const to = meals[toIndex]!;
      reorder({
        from: { id: from.id, position: from.position },
        to: { id: to.id, position: to.position },
      });
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Your meals</CardTitle>
          <CardDescription>
            These are your daily meals.
          </CardDescription>
        </div>
        <AddMeal />
      </CardHeader>
      <CardContent className="pt-6">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center hidden md:table-cell">Carbs</TableHead>
              <TableHead className="w-28 text-center hidden md:table-cell">Proteins</TableHead>
              <TableHead className="w-28 text-center hidden md:table-cell">Fats</TableHead>
              <TableHead className="w-28 text-center">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : null}
            {!isLoading && meals.length === 0 ? <EmptyRow /> : null}
            {meals.map((meal, index) => (
              <TableRow key={meal.id}>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <span>{meal.name}</span>
                    <span>
                      {meal.carbs_goal} C |{' '}
                      {meal.proteins_goal} P |{' '}
                      {meal.fats_goal} F
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">{meal.carbs_goal}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{meal.proteins_goal}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{meal.fats_goal}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <EllipsisVerticalIcon className="h-4 w-4"/>
                        <span className="sr-only">Toggle actions menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem disabled={isReordering || index === 0} onClick={() => handleReorder(meal.id, 'top')}>
                        <ChevronsUpIcon className="h-4 w-4 mr-2"/>
                        <span>Move to top</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isReordering || index === 0} onClick={() => handleReorder(meal.id, 'up')}>
                        <ChevronUpIcon className="h-4 w-4 mr-2"/>
                        <span>Move Up</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isReordering || index === meals.length - 1} onClick={() => handleReorder(meal.id, 'down')}>
                        <ChevronDownIcon className="h-4 w-4 mr-2"/>
                        <span>Move down</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isReordering || index === meals.length - 1} onClick={() => handleReorder(meal.id, 'bottom')}>
                        <ChevronsDownIcon className="h-4 w-4 mr-2"/>
                        <span>Move to bottom</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditingMeal(meal)}>
                        <PencilLineIcon className="h-4 w-4 mr-2"/>
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingMeal(meal)}>
                        <Trash2Icon className="h-4 w-4 mr-2"/>
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editingMeal ? <MealModal isEditing itemId={editingMeal.id} defaultValues={editingMeal} onClose={() => setEditingMeal(null)} /> : null}
        {deletingMeal ? <DeleteMealModal meal={deletingMeal} onClose={() => setDeletingMeal(null)} /> : null}
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
    </TableRow>
  );
}

function EmptyRow() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6">
        {`Let's`} get you started, add some food to track...
      </TableCell>
    </TableRow>
  );
}
