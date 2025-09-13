import { config } from "dotenv";
import { ConfigNotSetError } from "./errors.js"
import path from "path"

config() // Load env variables
export function getFromEnvironment(variableName: string): string {
    const variable = process.env[variableName]
    if (!variable) {
        console.log(`${variableName} not found`)
        throw new ConfigNotSetError(`${variableName} environment variable not set`)
    }
    return variable
}

const environment = getFromEnvironment("ENVIRONMENT")
if (environment == "local") {
    config({ path: "../terraform/dev_variables.tfvars", override: true })
}