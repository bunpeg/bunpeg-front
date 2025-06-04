'use client';
import { useState } from 'react';
import { ListPlusIcon } from 'lucide-react';

import { Button } from '@/ui';
import MealModal, { type MealInput } from './meal-modal';

export default function AddMeal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <span className="hidden md:inline">Add new meals</span>
        <ListPlusIcon className="h-4 w-4 block md:hidden" />
      </Button>
      {showModal ? <MealModal defaultValues={defaultValues} onClose={() => setShowModal(false)} /> : null}
    </>
  );
}

const defaultValues: MealInput = {
  name: '',
  carbs_goal: 0,
  proteins_goal: 0,
  fats_goal: 0,
};
