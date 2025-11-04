// import swaggerAutogen from 'swagger-autogen'

// const doc = {
//     info:{
//         title:"Auth Service API",
//         description:"Automatically generated Swagger docs",
//         version:"1.0.0",
//     },
//     host:"localhost:6001",
//     schemes:["http"],
// }


// const outputFile = "./swagger-output.ts";
// const endpointsFiles = ["../routes/auth.router.ts"];

// swaggerAutogen({language:'ts'})(outputFile,endpointsFiles,doc)

// swagger-gen.ts
// apps/auth-service/src/utils/swagger.js
import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = {
  info: {
    title: "Auth Service API",
    description: "Automatically generated Swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6001",
  schemes: ["http"],
};

// Absolute paths
const tempOutputFile = path.join(__dirname, "swagger-temp.json");
const finalOutputFile = path.join(__dirname, "swagger-output.ts");
const endpointsFiles = [path.join(__dirname, "../routes/auth.router.ts")];

swaggerAutogen()(tempOutputFile, endpointsFiles, doc).then(() => {
  const swaggerJson = fs.readFileSync(tempOutputFile, "utf-8");
  const tsContent = `export const swaggerDocs = ${swaggerJson} as const;\n`;
  fs.writeFileSync(finalOutputFile, tsContent, "utf-8");
  console.log("✅ Swagger TS file generated at", finalOutputFile);
});
