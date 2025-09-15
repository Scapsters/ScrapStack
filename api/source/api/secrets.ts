import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager"
import { getFromEnvironment } from "../utils/env.js"
import { AWSError } from "../utils/errors.js"

export async function getSecretString(secretEnviornmentName: string) {
    const environment = getFromEnvironment('ENVIRONMENT')
    if (environment == "local") {
        return getFromEnvironment(secretEnviornmentName)
    }
    
    const secretId = getFromEnvironment(secretEnviornmentName)
    const secretClient = new SecretsManagerClient({ region: 'us-east-1' })
    const secretValueCommand = new GetSecretValueCommand({ SecretId: secretId })
    const secretValueResponse = await secretClient.send(secretValueCommand)
    if (!secretValueResponse?.SecretString) throw new AWSError()
    return secretValueResponse.SecretString
}