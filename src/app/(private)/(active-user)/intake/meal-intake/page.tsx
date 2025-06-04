import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

import { getServerAuthSession } from '@/server/auth';
import FoodIntakeForm from './__components/food-intake-form';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/ui';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{
    meal: string;
    date: string;
    record?: string;
  }>;
}

export default async function MealIntake(props: Props) {
  const searchParams = await props.searchParams;
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect('/');
  }
  const { user } = session;

  const mealQ = await sql<{ id: number; name: string }>`
    SELECT id, name FROM meals WHERE id = ${searchParams.meal} AND user_id = ${user.id};`;

  const meal = mealQ.rows[0];

  if (!meal) {
    redirect('/intake');
  }

  if (searchParams.record) {
    const recordQ = await sql<{ food_id: number; amount: number }>`
      SELECT food_id, amount
      FROM meal_intakes
      WHERE id = ${searchParams.record} AND user_id = ${user.id};`;
    const record = recordQ.rows[0];

    if (!record) {
      redirect('/intake');
    }

    return (
      <FoodIntakeForm
        meal={meal}
        initialValues={record}
        day={new Date(searchParams.date)}
        itemId={Number(searchParams.record)}
      />
    );
  }

  return (
    <Card className="pt-4 h-screen pb-16 flex flex-col">
      <Link href="/intake">
        <Button variant="link">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Go back
        </Button>
      </Link>
      <CardHeader>
        <CardTitle>
          What did you eat for {meal.name}?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        <FoodIntakeForm meal={meal} day={new Date(searchParams.date)} />
      </CardContent>
    </Card>
  );
}
