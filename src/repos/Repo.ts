
export default class Repo {

    // protected tbl = 

    public constructor(tblName: string) {

    }

    protected responseData(type: number, error: boolean, message: string | null = null, data: Object = {}) {
        return {
            type,
            error,
            message,
            data
        }
    }

    // protected handleError(error: any){
    //     if (error.code === "23505") { // PostgreSQL unique violation error code
    //         const message = "Email already exists!";
    //         console.error(message);
    //         return this.responseData(400,true,message);
    //     } else if (error.code === "ECONNREFUSED") { // Connection refused
    //         const message = "Database connection failed!";
    //         console.error(message);
    //         return this.responseData(500, true, message);
    //     } else {
    //         console.error("An unexpected error occurred:", error.message);
    //         return this.responseData(500,true,"Internal Server Error");
    //     }
    // }

    protected handleError(error: any) {
        // PostgreSQL error codes (from Drizzle via Postgres driver)
        switch (error.code) {
            case '23505': // Unique violation (e.g., duplicate key)
                const uniqueMessage = error.message || "A unique constraint was violated (e.g., duplicate ID or email)";
                console.error(uniqueMessage);
                return this.responseData(400, true, uniqueMessage);

            case '23503': // Foreign key violation (e.g., parentId doesn’t exist in referenced table)
                const fkMessage = error.message || "A foreign key constraint failed (e.g., invalid parent ID)";
                console.error(fkMessage);
                return this.responseData(400, true, fkMessage);

            case '23502': // Not-null violation (e.g., required field missing)
                const notNullMessage = error.message || "A required field is missing";
                console.error(notNullMessage);
                return this.responseData(400, true, notNullMessage);

            case '22P02': // Invalid text representation (e.g., invalid data type)
                const invalidTypeMessage = error.message || "Invalid data type provided";
                console.error(invalidTypeMessage);
                return this.responseData(400, true, invalidTypeMessage);

            case '42703': // Undefined column (e.g., querying a nonexistent column)
                const undefinedColumnMessage = error.message || "Referenced an undefined column";
                console.error(undefinedColumnMessage);
                return this.responseData(400, true, undefinedColumnMessage);

            case '42P01': // Undefined table (e.g., table doesn’t exist)
                const undefinedTableMessage = error.message || "Referenced an undefined table";
                console.error(undefinedTableMessage);
                return this.responseData(500, true, undefinedTableMessage);

            case 'ECONNREFUSED': // Connection refused (network issue)
                const connMessage = "Database connection failed!";
                console.error(connMessage);
                return this.responseData(500, true, connMessage);

            case '08006': // Connection failure (generic PostgreSQL connection error)
                const connFailMessage = "Failed to connect to the database";
                console.error(connFailMessage);
                return this.responseData(500, true, connFailMessage);

            default:
                // Handle custom errors or uncaught Drizzle/PostgreSQL errors
                if (error.message?.includes("already exists")) {
                    console.error(error.message);
                    return this.responseData(400, true, error.message);
                } else if (error.message?.includes("does not exist")) {
                    console.error(error.message);
                    return this.responseData(404, true, error.message);
                } else {
                    const genericMessage = error.message || "Internal Server Error";
                    console.error("An unexpected error occurred:", genericMessage);
                    return this.responseData(500, true, genericMessage);
                }
        }
    }
}