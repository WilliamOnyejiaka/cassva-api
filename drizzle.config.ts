import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
config();

export default defineConfig({
    schema: "./src/drizzle/schema.ts", // Where the generated schema will be saved
    out: "./src/drizzle",            // Folder for migration files (optional)
    dialect: "postgresql",       // Specify PostgreSQL as the dialect
    dbCredentials: {
        url: process.env.DATABASE_URL!, // Use the Supabase connection string
    },
    schemaFilter: ["public"], // Explicitly limit to 'public' schema
    strict: true,
    verbose: true
});