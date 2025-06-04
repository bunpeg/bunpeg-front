'use client';
import { useState } from 'react';

import { Button } from '@/ui';
import FoodModal, { type FoodInput } from './food-modal';

export default function AddFood() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Add new food</Button>
      {showModal ? <FoodModal defaultValues={defaultValues} onClose={() => setShowModal(false)} /> : null}
    </>
  );
}

const defaultValues: FoodInput = {
  name: '',
  description: '',
  notes: '',
  amount: 0,
  unit: 'g',
  price: 0,
  carbs: 0,
  proteins: 0,
  fats: 0,
};
