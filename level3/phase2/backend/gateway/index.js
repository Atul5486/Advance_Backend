import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"
dotenv.config()

const port = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.get("/", (req, res) => {
    return res.status(200).json({ message: "hello from gateway" })
})

app.use("/auth",proxy("http://auth-service:8000"))
app.use("/order",proxy("http://order-service:8001"))
app.use("/product",proxy("http://product-service:8002"))

app.listen(port, () => {
    console.log(`server started ${port}`)
})