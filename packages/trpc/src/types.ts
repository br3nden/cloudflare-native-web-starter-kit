import type {FetchCreateContextFnOptions} from '@trpc/server/adapters/fetch';
import type { DrizzleDB }from "@acme/db";
import type { R2Bucket } from '@cloudflare/workers-types';

/** Minimal Clerk session shape used by API routers (avoids leaking internal Clerk types in emitted declarations). */
export interface SessionAuth {
  userId: string;
}

export interface CustomContext {
  req: FetchCreateContextFnOptions['req'];
  resHeaders: FetchCreateContextFnOptions['resHeaders'];
  user: SessionAuth | null;
  db: DrizzleDB;
  imagesBucket: R2Bucket;
}

export interface CustomContextOptions {
  clerkSecretKey: string;
  clerkPublicKey: string;
  db: DrizzleDB;
  imagesBucket: R2Bucket;
}
