import { z } from 'zod';
import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { tql } from '@/utils/tql';

export const setupRouter = createTRPCRouter({
  init: protectedProcedure
    .input(z.object({
      meals: z.array(z.object({
        name: z.string(),
        carbs: z.number().min(0).max(1),
        proteins: z.number().min(0).max(1),
        fats: z.number().min(0).max(1),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const client = await sql.connect();

      const normalisedMeals = input.meals.map((meal) => ({
        name: meal.name,
        carbs_goal: meal.carbs,
        proteins_goal: meal.proteins,
        fats_goal: meal.fats,
        user_id: userId,
      }));

      try {
        const [q, params] = tql.query`INSERT INTO meals ${tql.VALUES(normalisedMeals)}`;
        await client.query(q, params);
        await client.sql`UPDATE users SET is_setup = true WHERE id = ${userId}`;
        return true;
      } catch (_e) {
        console.log(_e);
        return false;
      } finally {
        client.release();
      }
    }),
});
