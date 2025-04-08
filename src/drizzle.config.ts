import { defineConfig } from "drizzle-kit";
import env from "./config/env";

export default defineConfig({
    schema: "./src/db/schema.ts", // Where the generated schema will be saved
    out: "./src/drizzle",            // Folder for migration files (optional)
    dialect: "postgresql",       // Specify PostgreSQL as the dialect
    dbCredentials: {
        url: env('databaseURL')!, // Use the Supabase connection string
    },
    schemaFilter: ["public"], // Explicitly limit to 'public' schema
    strict: true,
    verbose: true
});