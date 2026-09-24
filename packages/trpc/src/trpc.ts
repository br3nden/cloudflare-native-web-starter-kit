// packages/api/src/trpc.ts
import {initTRPC, TRPCError} from "@trpc/server";
import superjson from "superjson";
import {ZodError} from "zod";
import {createClerkClient} from '@clerk/backend'
import type {FetchCreateContextFnOptions} from '@trpc/server/adapters/fetch';
import type {CustomContext, CustomContextOptions} from "./types";

export async function createContext({
  req,
  resHeaders,
  clerkPublicKey,
  clerkSecretKey,
  db,
  imagesBucket
}: FetchCreateContextFnOptions & CustomContextOptions): Promise<CustomContext> {
  const clerk = createClerkClient({secretKey: clerkSecretKey, publishableKey: clerkPublicKey});

  const res = await clerk.authenticateRequest(req);

  const isSignedIn = res.isSignedIn

  if (!isSignedIn) {
    return {req, resHeaders, user: null, db, imagesBucket};
  }

  const auth = res.toAuth();
  const user =
    auth?.tokenType === 'session_token' &&
    auth.isAuthenticated &&
    auth.userId
      ? { userId: auth.userId }
      : null;

  return {req, resHeaders, user, db, imagesBucket};
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter: ({shape, error}) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure
  .use(({ctx, next}) => {
    if (ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated or Session Expired' });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });