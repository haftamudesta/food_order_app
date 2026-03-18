//start the server 

const app=require("./app")

const dotenv=require("dotenv")
dotenv.config({path:"./config/config.env"})

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is runing on port:${process.env.PORT}`)
})