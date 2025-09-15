import { writeFileSync } from "fs";
import { generateOpenAPIDocumentFromTRPCRouter } from "openapi-trpc";
import { router } from "./api/router.js";
var doc = generateOpenAPIDocumentFromTRPCRouter(router, {
    pathPrefix: '',
});
writeFileSync('swagger/openapi.json', JSON.stringify(doc, null, 2), 'utf-8');
