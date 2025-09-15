import { config } from "dotenv";
import { ConfigNotSetError } from "./errors.js";
config(); // Load env variables
export function getFromEnvironment(variableName) {
    var variable = process.env[variableName];
    if (!variable) {
        console.log("".concat(variableName, " not found"));
        throw new ConfigNotSetError("".concat(variableName, " environment variable not set"));
    }
    return variable;
}
var environment = getFromEnvironment("ENVIRONMENT");
if (environment == "local") {
    config({ path: "../terraform/dev_variables.tfvars", override: true });
}
