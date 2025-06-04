import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { setupRouter } from '@/server/api/routers/setup';
import { mealsRouter } from '@/server/api/routers/meals';
import { intakeRouter } from '@/server/api/routers/intake';
import { foodRouter } from '@/server/api/routers/food';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  setup: setupRouter,
  meals: mealsRouter,
  food: foodRouter,
  intake: intakeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
