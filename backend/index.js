const express = require('express')
const cors = require('cors')
const sgMail = require('@sendgrid/mail')
var bodyParser = require('body-parser')
const settings = require('./settings.json')
 

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

sgMail.setApiKey("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")


app.use(cors())


app.post('/',(req,res)=>{
    res.send("Hello")
})

app.post('/getquiz',(req,res)=>{
    var quiz = require('./quiz.json')
    var quizarray = quiz.questions
    const shuffled = quizarray.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, settings.noOfQuestions);
    quiz.questions=selected
    res.send(quiz)
})

app.post('/getquizdetails',(req,res)=>{
    var quiz = require('./quiz.json')
    res.send(quiz.module)
})

app.post('/sendmail',(req,res)=>{
   
    const msg={
        to:req.body.email,
        from:"bcoder23544@gmail.com",
        subject:"OTP for Quiz App",
        text:`Here's your OTP ${req.body.otp}`
    }
    console.log(msg,"msg")
    try{
    sgMail.send(msg)
    res.send(req.body)
}
catch(err){
    console.log(err)
    res.send(err)
}

// console.log(req.body,"req")
// res.send("sucess")

})

app.listen(4000,()=>{
    console.log("Listening on 4000")
})