import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager"
import { getFromEnvironment } from "./env.js"
import { TRPCError } from "@trpc/server"

export async function getSecretString(secretEnviornmentName: string) {
    const environment = getFromEnvironment('ENVIRONMENT')
    if (environment == "local") {
        return getFromEnvironment(secretEnviornmentName)
    }
    
    const secretId = getFromEnvironment(secretEnviornmentName)
    const secretClient = new SecretsManagerClient({ region: 'us-east-1' })
    const secretValueCommand = new GetSecretValueCommand({ SecretId: secretId })
    const secretValueResponse = await secretClient.send(secretValueCommand)
    if (!secretValueResponse?.SecretString) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message:'Failed to get secret string ' + secretEnviornmentName })
    return secretValueResponse.SecretString
}