import { writeFileSync } from "fs";
//@ts-ignore
import { generateOpenAPIDocumentFromTRPCRouter } from "openapi-trpc"
import { router } from "./api.js"

const doc = generateOpenAPIDocumentFromTRPCRouter(router, {
  pathPrefix: '',
})

writeFileSync('swagger/openapi.json', JSON.stringify(doc, null, 2), 'utf-8');