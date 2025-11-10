import express from 'express';
import cors from 'cors'
import './jobs/product-cron-job';
// import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import errorMiddleware from '../../../packages/libs/errorMiddleware/errorMiddleware';
// import errorMiddleware from '@packages/libs/errorMiddleware/errorMiddleware';
// import router from './routes/auth.router';

// import  AuthRouter from './routes/auth.router';
import  SwaggerUi  from 'swagger-ui-express';

import cookieParser from 'cookie-parser';
import router from './routes/product.routes';
import { swaggerDocs } from './swagger-output';

// import redis from '@packages/libs/redis';



const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 6002;

const app = express();

app.use(cookieParser());
app.set("trust proxy",1);

 app.use(express.json({limit:"100mb"}));
 app.use(express.urlencoded({limit:"100mb",extended:true}));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API Product service' });
});

// Routes
app.use("/",router);

console.log('___REACHED Product SERVICE_____');
app.use('/api-docs',SwaggerUi.serve,SwaggerUi.setup(swaggerDocs));
app.get('/docs-json',(req,res)=>{
  res.json(swaggerDocs);
})



// app.use('/',router);
app.use((err:any,req:any,res:any,next:any)=>errorMiddleware(err,req,res));
const server = app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port} Product service is running at http://localhost:${port}/api ` );
  console.log(`swagger Docs available at http:/localhost:${port}/docs`)
  
});


server.on('error',(error)=>{
console.log("Server Error :  "+error)

})