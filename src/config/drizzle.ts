import { drizzle, PostgresJsTransaction } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema";
import { ExtractTablesWithRelations } from "drizzle-orm";
import env from "./env";

console.log(env('databaseURL'));


export const client = postgres(env('databaseURL')!);

export const db = drizzle(client, {
    schema,
    logger: true
});

export type db = typeof db;
export type Transaction = PostgresJsTransaction<
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>;
export default db;