import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_HOST!);

redis.on('error',(err)=>{
      console.error('**************************Redis Error**************************')
      console.log(err);
      console.error('**************************Redis Error**************************')
})


export default redis