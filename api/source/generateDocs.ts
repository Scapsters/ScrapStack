import { writeFileSync } from "fs";
import { router } from "./api"
import { generateOpenAPIDocumentFromTRPCRouter } from "openapi-trpc"

const doc = generateOpenAPIDocumentFromTRPCRouter(router, {
  pathPrefix: '/trpc',
})

writeFileSync("openapi.json", JSON.stringify(doc, null, 2));