//configure express and middleware

const express=require("express")

const app=express()
const cors=require("cors")
const bodyParser=require("body-parser")

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

module.exports=app