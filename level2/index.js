import express from 'express'
import { configDotenv } from 'dotenv';
import connectDb from './config/db.js'
import Redis from 'ioredis';
import userModel from './model/user.model.js'
import {rateLimiter} from './middleware/rateLimiter.js'
configDotenv()

const app=express();

const port =process.env.PORT || 5000

export const redis=new Redis(process.env.REDIS_PORT)

app.use(express.json())

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello from redis"});
})

app.post("/create",async(req,res)=>{
    const { name, email, password } = req.body

   await redis.del("user:all")

     const user = await userModel.create({
        name, email, password
    })

    res.json(user);

})

app.get("/get",rateLimiter,async(req,res)=>{
    const user = await userModel.find({})
    return res.json(user)
})

app.get("/get-with-redis",async(req,res)=>{

    const cached=await redis.get("user:all");

    if(cached){
        const user=await JSON.parse(cached)
        return res.status(200).json(user);
    }

    const user = await userModel.find({})

    await redis.set("user:all",JSON.stringify(user));

    return res.json(user)
})

app.post("/send-otp",async(req,res)=>{

    const {email}=req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await redis.set(`user:${email}`,otp,'EX',30);

    res.status(201).json({emssage:"OTP sent successfully "+otp});

})

app.post("/verify-otp",async(req,res)=>{
    const {otp,email}=req.body;

    const store= await redis.get(`user:${email}`);

    if(!store){
        return res.status(404).json({message:"OTP Expire"});
    }

    if(otp!==store){
         return res.status(404).json("Invalid OTP");   
    }

    res.status(200).json({message:"OTP verfiy successfully"});
})

app.listen(port,()=>{
    connectDb();
    console.log("Server started "+port);
})