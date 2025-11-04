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
// const endpointsFiles = ["../src/routes/product.routes.ts"];

// swaggerAutogen({language:'ts'})(outputFile,endpointsFiles,doc)


import swaggerAutogen from 'swagger-autogen';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = {
  info: {
    title: "Product Service API",
    description: "Automatically generated Swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6002",
  schemes: ["http"],
};

// Absolute paths
const tempOutputFile = path.join(__dirname, "/swagger-temp.json");
const finalOutputFile = path.join(__dirname, "/swagger-output.ts");
const endpointsFiles = [path.join(__dirname, "/routes/product.routes.ts")];
console.log('________________paths_________________-');
console.log(endpointsFiles);
console.log('________________paths_________________-');
console.log(tempOutputFile);
console.log('________________paths_________________-');
console.log(finalOutputFile);
console.log('________________paths_________________-');

swaggerAutogen()(tempOutputFile, endpointsFiles, doc).then(() => {
  const swaggerJson = fs.readFileSync(tempOutputFile, "utf-8");
  const tsContent = `export const swaggerDocs = ${swaggerJson} as const;\n`;
  fs.writeFileSync(finalOutputFile, tsContent, "utf-8");
  console.log("✅ Swagger TS file generated at", finalOutputFile);
});





// import swaggerAutogen from 'swagger-autogen';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import routes from './routes/product.routes.ts'; // ✅ correct relative path

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const doc = {
//   info: {
//     title: "Product Service API",
//     description: "Automatically generated Swagger docs",
//     version: "1.0.0",
//   },
//   host: "localhost:6002",
//   schemes: ["http"],
// };

// // ✅ Generate Swagger output files
// const tempOutputFile = path.join(__dirname, "swagger-temp.json");
// const finalOutputFile = path.join(__dirname, "swagger-output.ts");

// // ✅ Point swaggerAutogen to your actual route file
// const endpointsFiles = [path.join(__dirname, "./routes/product.routes.ts")];
// console.log('____________________',endpointsFiles);
// swaggerAutogen()(tempOutputFile, endpointsFiles, doc).then(() => {
//   const swaggerJson = fs.readFileSync(tempOutputFile, "utf-8");
//   const tsContent = `export const swaggerDocs = ${swaggerJson} as const;\n`;
//   fs.writeFileSync(finalOutputFile, tsContent, "utf-8");
//   console.log("✅ Swagger TS file generated at", finalOutputFile);
// });
