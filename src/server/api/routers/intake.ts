import { z } from 'zod';
import { format } from 'date-fns';
import { sql } from '@vercel/postgres';
import { TRPCError } from '@trpc/server';

import { tql } from '@/utils/tql';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const intakeRouter = createTRPCRouter({
  forDay: protectedProcedure
    .input(z.object({
      day: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const intakeRecordsQ = await sql<{
        meal_id: number;
        meal_name: string;
        carbs_goal: number;
        proteins_goal: number;
        fats_goal: number;
        position: number;
        is_hidden: boolean;
        hidden_at: Date | null;
        created_at: Date;
        foods: {
          id: number;
          food_id: number;
          name: string;
          description: string;
          notes: string;
          base_amount: number;
          amount_consumed: number;
          unit: string;
          carbs: number;
          proteins: number;
          fats: number;
          price: number;
          is_hidden: boolean;
          hidden_at: Date | null;
          created_at: Date;
        }[];
      }>`
        SELECT
          m.id AS meal_id,
          m.name AS meal_name,
          m.carbs_goal,
          m.proteins_goal,
          m.fats_goal,
          m.position,
          m.is_hidden,
          m.hidden_at,
          m.created_at,
          COALESCE(JSON_AGG(
            CASE WHEN f.id IS NOT NULL THEN JSON_BUILD_OBJECT(
              'id', mi.id,
              'food_id', f.id,
              'name', f.name,
              'description', f.description,
              'notes', f.notes,
              'base_amount', f.amount,
              'amount_consumed', mi.amount,
              'unit', f.unit,
              'carbs', f.carbs,
              'proteins', f.proteins,
              'fats', f.fats,
              'price', f.price,
              'is_hidden', f.is_hidden,
              'hidden_at', f.hidden_at,
              'created_at', f.created_at
                ) END
              ) FILTER (WHERE f.id IS NOT NULL), '[]') AS foods
        FROM meals m
          LEFT JOIN meal_intakes mi ON mi.meal_id = m.id
                AND mi.for_date::DATE = ${format(input.day, 'yyyy-MM-dd')}
                AND mi.user_id = ${userId}
          LEFT JOIN food f ON f.id = mi.food_id
        WHERE m.user_id = ${userId}
        GROUP BY m.id, m.name, m.carbs_goal, m.proteins_goal, m.fats_goal
        ORDER BY m.position;`;
      return intakeRecordsQ.rows;
    }),

  add: protectedProcedure
    .input(z.object({
      meal_id: z.number(),
      for_date: z.date(),
      food_id: z.number().min(0, 'Please select a food item'),
      amount: z.number().min(0, 'Please enter an amount'),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [insertQ, insertP] = tql.query`
        INSERT INTO meal_intakes ${tql.VALUES({ ...input, for_date: input.for_date.toDateString(), user_id: userId })}`;
      await sql.query(insertQ, insertP);

      return true;
    }),

  duplicate: protectedProcedure
    .input(z.object({
      from_day: z.date(),
      to_day: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const recordsQ = await sql<{ meal_id: number; food_id: number; amount: number }>`
        SELECT meal_id, food_id, amount
        FROM meal_intakes
        WHERE for_date::DATE = ${format(input.from_day, 'yyyy-MM-dd')} AND user_id = ${userId}`;

      const records = recordsQ.rows;

      if (!records.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No meals found on ${format(input.from_day, 'dd MMMM')}`,
        });
      }

      const newRecords = records.map(record => ({
        ...record,
        user_id: userId,
        for_date: input.to_day.toDateString(),
      }));

      const [insertQ, insertP] = tql.query`INSERT INTO meal_intakes ${tql.VALUES(newRecords)}`;
      await sql.query(insertQ, insertP);

      return true;
    }),

  update: protectedProcedure
    .input(z.object({
      intake_id: z.number(),
      food_id: z.number({ required_error: 'Please select a food item' }),
      amount: z.number().min(0, 'Please enter an amount'),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [insertQ, insertP] = tql.query`
        UPDATE meal_intakes ${tql.SET({ food_id: input.food_id, amount: input.amount })}
        WHERE id = ${input.intake_id} AND user_id = ${userId}`;
      await sql.query(insertQ, insertP);

      return true;
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await sql`DELETE FROM meal_intakes WHERE id = ${input.id} AND user_id = ${userId}`;
      return true;
    }),
});
