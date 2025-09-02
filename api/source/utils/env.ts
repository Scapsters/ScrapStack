import { config } from "dotenv";
import { ConfigNotSetError } from "./errors"

config() // Load env variables
export function getFromEnvironment(variableName: string): string {
    const variable = process.env[variableName]
    if (!variable) {
        throw new ConfigNotSetError(`${variableName} environment variable not set`)
    }
    return variable
}