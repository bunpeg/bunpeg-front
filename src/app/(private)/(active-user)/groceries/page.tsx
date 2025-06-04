'use client';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EllipsisVerticalIcon,
  InfoIcon,
  PencilLineIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';
import { type inferRouterOutputs } from '@trpc/server';

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
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useDebounce,
} from '@/ui';
import { api } from '@/trpc/react';
import { type AppRouter } from '@/server/api/root';
import { formatCurrency } from '@/utils/numbers';
import AddFood from './__components/add-food';
import FoodModal from './__components/food-modal';
import DeleteFoodModal from './__components/delete-food-modal';

type Food = inferRouterOutputs<AppRouter>['food']['list'][0];

export default function MealsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const order = (searchParams.get('order') ?? 'asc') as 'asc' | 'desc';

  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);

  const { debounceCall } = useDebounce(250);

  const { data: foods = [], isLoading } = api.food.list.useQuery({ search, order });

  const updateRoute = (values: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        value === '' ? params.delete(key) : params.set(key, value);
      }
    }

    router.push(pathname + '?' + params.toString());
  }

  const handleSearch = (value: string) => {
    debounceCall(() => {
      updateRoute({ search: value, page: '1' });
    });
  }

  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Your groceries</CardTitle>
          <CardDescription className="hidden md:block">
            A list of all the food commonly eat and want to track
          </CardDescription>
        </div>
        <AddFood />
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-6">
        <div className="relative flex-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg bg-white pl-8 md:w-[200px] lg:w-[300px] dark:bg-gray-950"
          />
        </div>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-0"
                  onClick={() => updateRoute({ order: order === 'asc' ? 'desc' : 'asc' })}
                >
                  <span className="mr-1">Name</span>
                  {order === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : null}
                  {order === 'desc' ? <ArrowDownIcon className="h-4 w-4" /> : null}
                </Button>
              </TableHead>
              <TableHead className="w-28 text-center hidden md:table-cell">Amount</TableHead>
              <TableHead className="w-28 text-center hidden md:table-cell">price</TableHead>
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
            {!isLoading && foods.length === 0 ? <EmptyRow /> : null}
            {foods.map((food) => (
              <TableRow key={food.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{food.name}</span>
                      {food.notes ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoIcon className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-80">
                              <p>{food.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </div>
                    <span className="md:hidden">
                      {`${food.amount} ${food.unit}`} |{' '}
                      {formatCurrency(food.price, 'gbp')}
                    </span>
                    <span className="md:hidden">
                      {food.carbs} C |{' '}
                      {food.proteins} P |{' '}
                      {food.fats} F
                    </span>
                    <span className="text-sm text-muted-foreground">{food.description}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">{`${food.amount} ${food.unit}`}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{formatCurrency(food.price, 'gbp')}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{food.carbs}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{food.proteins}</TableCell>
                <TableCell className="text-center hidden md:table-cell">{food.fats}</TableCell>
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
                      <DropdownMenuItem onClick={() => setEditingFood(food)}>
                        <PencilLineIcon className="h-4 w-4 mr-2"/>
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingFood(food)}>
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
        {editingFood ? <FoodModal isEditing itemId={editingFood.id} defaultValues={editingFood} onClose={() => setEditingFood(null)} /> : null}
        {deletingFood ? <DeleteFoodModal food={deletingFood} onClose={() => setDeletingFood(null)} /> : null}
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
