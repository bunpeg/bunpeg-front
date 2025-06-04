import { sql } from '@vercel/postgres';
import { format } from 'date-fns';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { tql } from '@/utils/tql';

export const mealsRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const mealsQ = await sql<{
        id: number;
        name: string;
        carbs_goal: number;
        proteins_goal: number;
        fats_goal: number;
        position: number;
      }>`
        SELECT id, name, carbs_goal, proteins_goal, fats_goal, position
        FROM meals
        WHERE user_id = ${userId}
          AND is_hidden = false
        ORDER BY position`;
      return mealsQ.rows;
    }),

  add: protectedProcedure
    .input(z.object({
      name: z.string(),
      carbs_goal: z.number().min(0),
      proteins_goal: z.number().min(0),
      fats_goal: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [insertQ, insertP] = tql.query`
        INSERT into meals ${tql.VALUES({ ...input, user_id: userId })}`;
      await sql.query(insertQ, insertP);
      return true;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
      carbs_goal: z.number().min(0),
      proteins_goal: z.number().min(0),
      fats_goal: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...mealAttrs } = input;

      const [updateQ, updateP] = tql.query`
        UPDATE meals ${tql.SET(mealAttrs)}
        WHERE user_id = ${userId}
          AND id = ${id}
          AND is_hidden = false`;
      await sql.query(updateQ, updateP);
      return true;
    }),

  updateOrder: protectedProcedure
    .input(z.object({
      from: z.object({
        id: z.number(),
        position: z.number(),
      }),
      to: z.object({
        id: z.number(),
        position: z.number(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const client = await sql.connect();

      try {
        await client.sql`UPDATE meals SET position = ${input.to.position} WHERE id = ${input.from.id} AND user_id = ${userId}`;
        await client.sql`UPDATE meals SET position = ${input.from.position} WHERE id = ${input.to.id} AND user_id = ${userId}`;
        return true;
      } catch (e) {
        throw e;
      } finally {
        client.release();
      }
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const today = new Date();

      await sql`
        UPDATE meals SET is_hidden = true, hidden_at = ${format(today, 'yyyy-MM-dd')}
        WHERE user_id = ${userId} AND id = ${input.id}`;
      return true;
    }),
});
