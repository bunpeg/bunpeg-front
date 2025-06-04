import { z } from 'zod';
import { format } from 'date-fns';
import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { tql } from '@/utils/tql';

export const foodRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      list_on_search: z.boolean().default(false),
      search: z.string().nullish(),
      order: z.enum(['asc', 'desc']),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { search, order, list_on_search } = input;

      if (list_on_search && !search) {
        return [];
      }

      const filters = [];

      if (search) {
        filters.push(tql.fragment`name ILIKE ${`%${search}%`}`);
      }

      let filterClause = tql.fragment``;
      if (filters.length > 0) {
        for (const filter of filters) {
          filterClause = tql.fragment`${filterClause} AND ${filter}`;
        }
      }

      const limitClause = list_on_search ? tql.fragment`LIMIT 3` : tql.fragment``;

      const [listQ, listP] = tql.query`
        SELECT id, name, description, notes, amount, unit, price, carbs, proteins, fats
        FROM food
        WHERE user_id = ${userId} AND is_hidden = false ${filterClause}
        ORDER BY name ${tql.UNSAFE(order.toUpperCase())} ${limitClause}`;

      console.log('listQ', listQ, listP);

      const foodQ = await sql.query<{
        id: number;
        name: string;
        description: string;
        notes: string;
        amount: number;
        unit: string;
        price: number;
        carbs: number;
        proteins: number;
        fats: number;
      }>(listQ, listP);

      return foodQ.rows;
    }),

  add: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Please add a name'),
      description: z.string(),
      notes: z.string(),
      amount: z.number().min(1, 'Please add an amount'),
      unit: z.string().min(1, 'Please add a unit'),
      price: z.number(),
      carbs: z.number().min(0),
      proteins: z.number().min(0),
      fats: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [insertQ, insertP] = tql.query`
        INSERT INTO food ${tql.VALUES({ ...input, user_id: userId })}`;
      await sql.query(insertQ, insertP);

      return insertQ;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1, 'Please add a name'),
      description: z.string(),
      notes: z.string(),
      amount: z.number().min(1, 'Please add an amount'),
      unit: z.string().min(1, 'Please add a unit'),
      price: z.number(),
      carbs: z.number().min(0),
      proteins: z.number().min(0),
      fats: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...foodAttrs } = input;

      const [insertQ, insertP] = tql.query`
        UPDATE food ${tql.SET(foodAttrs)}
        WHERE user_id = ${userId}
          AND id = ${id}
          AND is_hidden = false`;
      await sql.query(insertQ, insertP);

      return insertQ;
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const today = new Date();

      await sql`
        UPDATE food SET is_hidden = true, hidden_at = ${format(today, 'yyyy-MM-dd')}
        WHERE user_id = ${userId} AND id = ${input.id}`;
      return true;
    }),
});
