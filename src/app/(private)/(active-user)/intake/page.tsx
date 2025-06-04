'use client';

import { useState } from 'react';
import { addDays, subDays } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, DatePicker, Skeleton } from '@/ui';
import { api } from '@/trpc/react';
import { generateGoalsAndSums, resolveMeals } from '@/utils/meal-intakes';
import GoalRing from '@/components/goal-ring';
import MealCard from './__components/meal-card';
import CopyFromDay from './__components/copy-from-day';

export default function IntakePage() {
  const [date, setDate] = useState(new Date());

  const { data: records = [], isLoading } = api.intake.forDay.useQuery({ day: date });
  const meals = resolveMeals(records, date);

  const goalsAndSums = generateGoalsAndSums(records, date);

  const goToPrevDay = () => {
    const nextDate = subDays(date, 1);
    setDate(nextDate);
  };

  const goToNextDay = () => {
    const nextDate = addDays(date, 1);
    setDate(nextDate);
  }

  const handleDateChange = (nextDate: Date | undefined) => {
    if (nextDate) {
      setDate(nextDate);
    }
  }

  return (
    <section className="flex flex-col md:gap-10">
      <Card>
        <CardHeader className="space-y-0 flex flex-row items-center justify-between">
          <CardTitle>Your Daily intake</CardTitle>
          <div className="flex items-center gap-4">
            <GoalRing label="Carbs" ratio={goalsAndSums.carbsRatio} sum={goalsAndSums.carbsSum} total={goalsAndSums.carbsTotals} />
            <GoalRing label="Proteins" ratio={goalsAndSums.proteinsRatio} sum={goalsAndSums.proteinsSum} total={goalsAndSums.proteinsTotals} />
            <GoalRing label="Fats" ratio={goalsAndSums.fatsRatio} sum={goalsAndSums.fatsSum} total={goalsAndSums.fatsTotals} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-row items-center justify-between pb-6">
          <div className="flex items-center justify-end gap-4 flex-1 md:flex-grow-0">
            <Button variant="outline" size="icon" onClick={goToPrevDay}>
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <DatePicker date={date} defaultMonth={date} onChange={handleDateChange} className="flex-1 md:flex-grow-0 justify-center md:justify-start" />
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
            <CopyFromDay day={date} />
          </div>
        </CardContent>
      </Card>
      {isLoading ? <Skeletons /> : null}
      {meals.map(meal => (
        <MealCard key={meal.id} meal={meal} day={date} />
      ))}
      {!isLoading && meals.length === 0 ? <NoData /> : null}
    </section>
  );
}

function Skeletons() {
  return (
    <>
      <Skeleton className="h-72 bg-white border" />
      <Skeleton className="h-72 bg-white border" />
      <Skeleton className="h-72 bg-white border" />
      <Skeleton className="h-72 bg-white border" />
    </>
  );
}

function NoData() {
  return (
    <Card>
      <CardHeader className="flex flex-cold items-center justify-center">
        <CardTitle className="w-2/3">Oops...</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-cold items-center justify-center pt-4">
        <p className="w-2/3">
          It seems like you went to far back, to before you started with us,
          so we {`don't`} have much to show you,{' '}
          <strong>unless</strong> you have learned how to go <strong className="uppercase">back in time</strong>,
          but in that case you already know.....
          <br />
          <br />
          If you think this is not right and we made a mistake, please let us know and we will take a look,
          though is not as exiting as time traveling.
        </p>
      </CardContent>
    </Card>
  );
}
