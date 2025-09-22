import { config } from "dotenv";
import { TRPCError } from "@trpc/server"

config() // Load env variables
export function getFromEnvironment(variableName: string): string {
    const variable = process.env[variableName]
    if (!variable) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message:`${variableName} environment variable not set` })
    }
    return variable
}

const environment = getFromEnvironment("ENVIRONMENT")
if (environment == "local") {
    console.log(environment)
    config({ path: "../terraform/dev_variables.tfvars", override: true })
}
