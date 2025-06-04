import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button, InputWithLabel } from '@/ui';

interface Props {
  onSubmit: (goals: { grams: number; carbs: number; proteins: number; fats: number }) => void;
}

const calculatorSchema = z.object({
  calories: z.number(),
  default_carbs: z.number().min(0),
  default_proteins: z.number().min(0),
  default_fats: z.number().min(0),
  grams: z.number().min(0),
  product_carbs: z.number().min(0),
  product_proteins: z.number().min(0),
  product_fats: z.number().min(0),
  gram_goals: z.number().min(0),
  carbs_goals: z.number().min(0),
  proteins_goals: z.number().min(0),
  fats_goals: z.number().min(0),
});
type CalculatorInput = z.infer<typeof calculatorSchema>;

export default function ExchangeCalculator(props: Props) {
  const { onSubmit } = props;

  const calculatorForm = useForm<CalculatorInput>({
    defaultValues: {
      calories: 0,
      default_carbs: 0,
      default_proteins: 0,
      default_fats: 0,
      grams: 0,
      product_carbs: 0,
      product_proteins: 0,
      product_fats: 0,
      gram_goals: 0,
      carbs_goals: 0,
      proteins_goals: 0,
      fats_goals: 0,
    },
    resolver: zodResolver(calculatorSchema),
  });

  const updateGoals = (updates: Partial<CalculatorInput>) => {
    const {
      calories,
      gram_goals,
      default_carbs,
      default_proteins,
      default_fats,
    } = ({ ...calculatorForm.getValues(), ...updates });

    const grams = 10000 / calories;
    const productCarbs = default_carbs * grams * 4 /10000;
    const productProteins = default_proteins * grams * 4 / 10000;
    const productFats = default_fats * grams * 9 / 10000;

    const carbGoals = gram_goals / grams * productCarbs;
    const proteinGoals = gram_goals / grams * productProteins;
    const fatGoals = gram_goals / grams * productFats;

    calculatorForm.setValue('grams', grams);
    calculatorForm.setValue('product_carbs', productCarbs);
    calculatorForm.setValue('product_proteins', productProteins);
    calculatorForm.setValue('product_fats', productFats);

    calculatorForm.setValue('carbs_goals', carbGoals);
    calculatorForm.setValue('proteins_goals', proteinGoals);
    calculatorForm.setValue('fats_goals', fatGoals);
  };

  const handleSubmit = () => {
    const values = calculatorForm.getValues();
    onSubmit({
      grams: values.gram_goals,
      carbs: values.carbs_goals,
      proteins: values.proteins_goals,
      fats: values.fats_goals,
    });
  };

  return (
    <div className="bg-neutral-100 rounded flex flex-col justify-between gap-6 py-4 px-4 md:px-2">
      <span>Exchange Calculator</span>
      <div className="grid grid-cols-2 md:grid-cols-4 items-end gap-x-2 gap-y-6">
        {/* Product inputs */}
        <span className="col-span-2 md:col-span-4">Product</span>
        <Controller
          name="calories"
          control={calculatorForm.control}
          render={({ field, formState }) => (
            <InputWithLabel
              type="number"
              label="Calories"
              {...field}
              value={field.value ?? 0}
              onChange={(e) => {
                const __calories = Number(e.target.value);
                field.onChange(__calories);
                updateGoals({ calories: __calories });
              }}
              error={formState.errors.calories?.message}
            />
          )}
        />
        <Controller
          name="default_carbs"
          control={calculatorForm.control}
          render={({ field, formState }) => (
            <InputWithLabel
              type="number"
              label="Carbs"
              {...field}
              value={field.value ?? 0}
              onChange={(e) => {
                const __carbs = Number(e.target.value);
                field.onChange(__carbs);
                updateGoals({ default_carbs: __carbs });
              }}
              error={formState.errors.default_carbs?.message}
            />
          )}
        />
        <Controller
          name="default_proteins"
          control={calculatorForm.control}
          render={({ field, formState }) => (
            <InputWithLabel
              type="number"
              label="Proteins"
              {...field}
              value={field.value ?? 0}
              onChange={(e) => {
                const __proteins = Number(e.target.value);
                field.onChange(__proteins);
                updateGoals({ default_proteins: __proteins });
              }}
              error={formState.errors.default_proteins?.message}
            />
          )}
        />
        <Controller
          name="default_fats"
          control={calculatorForm.control}
          render={({ field, formState }) => (
            <InputWithLabel
              type="number"
              label="Fats"
              {...field}
              value={field.value ?? 0}
              onChange={(e) => {
                const __fats = Number(e.target.value);
                field.onChange(__fats);
                updateGoals({ default_fats: __fats });
              }}
              error={formState.errors.default_fats?.message}
            />
          )}
        />

        {/* Product exchanges */}
        <span className="col-span-2 md:col-span-4">Product exchanges</span>
        <div className="flex flex-col gap-2">
          <Controller
            name="grams"
            control={calculatorForm.control}
            render={({ field }) => (
              <InputWithLabel
                readOnly
                type="number"
                label="Grams"
                {...field}
                value={field.value ?? 0}
              />
            )}
          />
        </div>
        <Controller
          name="product_carbs"
          control={calculatorForm.control}
          render={({ field }) => (
            <InputWithLabel
              readOnly
              type="number"
              label="Carbs"
              {...field}
              value={field.value ?? 0}
            />
          )}
        />
        <Controller
          name="product_proteins"
          control={calculatorForm.control}
          render={({ field }) => (
            <InputWithLabel
              readOnly
              type="number"
              label="Proteins"
              {...field}
              value={field.value ?? 0}
            />
          )}
        />
        <Controller
          name="product_fats"
          control={calculatorForm.control}
          render={({ field }) => (
            <InputWithLabel
              readOnly
              type="number"
              label="Fats"
              {...field}
              value={field.value ?? 0}
            />
          )}
        />

        <span className="col-span-2 md:col-span-4">Goals</span>
        <Controller
          name="gram_goals"
          control={calculatorForm.control}
          render={({ field, formState }) => (
            <InputWithLabel
              type="number"
              label="Gram goals"
              {...field}
              value={field.value ?? 0}
              onChange={(e) => {
                const __gramGoals = Number(e.target.value);
                field.onChange(__gramGoals);
                updateGoals({ gram_goals: __gramGoals });
              }}
              error={formState.errors.gram_goals?.message}
            />
          )}
        />
        <Controller
          name="carbs_goals"
          control={calculatorForm.control}
          render={({ field }) => (
            <InputWithLabel
              readOnly
              type="number"
              label="Carb goals"
              {...field}
              value={field.value ?? 0}
            />
          )}
        />
        <Controller
          name="proteins_goals"
          control={calculatorForm.control}
          render={({ field }) => (
            <InputWithLabel
              readOnly
              type="number"
              label="Protein goals"
              {...field}
              value={field.value ?? 0}
            />
          )}
        />
        <Controller
          name="fats_goals"
          control={calculatorForm.control}
          render={({ field }) => (
            <InputWithLabel
              readOnly
              type="number"
              label="Fat goals"
              {...field}
              value={field.value ?? 0}
            />
          )}
        />
      </div>
      <Button type="button" className="ml-auto px-8" onClick={handleSubmit}>Use exchanges</Button>
    </div>
  );
}
