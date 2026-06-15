import express from 'express'
import { configDotenv } from 'dotenv';

configDotenv()

const app=express();

const port =process.env.PORT || 5000

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello from docker compose"});
})

app.listen(port,()=>{
    console.log("Server started "+port);
})