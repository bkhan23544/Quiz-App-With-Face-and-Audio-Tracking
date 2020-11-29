import React, { useEffect,useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import LiveHelp from '@material-ui/icons/LiveHelp';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';
import { useRouter } from 'next/router';
import FaceModal from '../components/facealignmodal'
import AudioModal from '../components/audioCheckmodal'

const useStyles = makeStyles((theme) => ({
    root: theme.mixins.gutters({
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: theme.spacing(3),
        width: "100%",
    }),
    button: {
        pointerEvents: "none",
        boxShadow: "none"
    },
    questionMeta: {
        marginLeft: 10,
        display: "inline"
    },
    footer: {
        marginTop: "40px"
    }
}))





export default function Quiz({ finalObj }) {
    const [current, setCurrent] = React.useState(0)
    const router = useRouter()
    const childRef = useRef();
    const [timeleftAll, setTimeLeftAll] = React.useState(finalObj.time)
    const [perQuestionTime,setPerQuestionTime] = React.useState(finalObj.quiz[current].time_allowed)
    const totalTimeRef = useRef(timeleftAll);
    totalTimeRef.current = timeleftAll
    const calculateTimeLeft = () => {
        var times = totalTimeRef.current
        let timeLeft = {};

        if (times > 0) {
            timeLeft = {
                minutes: Math.floor((times * 1000 / 1000 / 60) % 60),
                seconds: Math.floor((times * 1000 / 1000) % 60)
            };



            return timeLeft;

        }
    }




    const classes = useStyles();

    
    const [selectedValue, setSelectedValue] = React.useState('')
    const [questions, setQuestions] = React.useState(finalObj.quiz)
    const [userAnswers, setUserAnswers] = React.useState([])
    const [quizEnd, setQuizEnd] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());
    const countRef = useRef(perQuestionTime);
    countRef.current = perQuestionTime;







    const handleChange = (e) => {
        setSelectedValue(e.target.value)
    }

const onNext=()=>{
    if(selectedValue){
gotoNext()
    }
    else{
        if(confirm("Do you want to leave this answer empty?")){
            gotoNext()
        }
    }
}


    const gotoNext = () => {
        setPerQuestionTime(finalObj.quiz[current].time_allowed)
        var answers = userAnswers
        // console.log(parseInt(selectedValue)+1,"selected")
 
        if (parseInt(selectedValue)+1 == questions[current].correct_choice) {
            answers.push(true)
            setUserAnswers(answers)
        }
        else {
            answers.push(false)
            setUserAnswers(answers)
        }

        if (current == questions.length - 1) {
            var objToSubmit = {
                quiz_name: finalObj.module.quiz_name,
                category: finalObj.module.category,
                section: finalObj.module.section,
                priority: finalObj.module.priority,
                organization:finalObj.module.organization,
                project:finalObj.module.project,
                score:userAnswers.filter(Boolean).length,
                scoreArray:userAnswers,
                email:localStorage.getItem("email")
            }
            console.log(objToSubmit,"Object To Submit")
            setQuizEnd(true)
        }
        else {
            setCurrent(current + 1)
            setSelectedValue('')
        }
  

    }

    const calculateQuesTime = () =>{
        var times = countRef.current
        if(times<1){
            setPerQuestionTime(finalObj.quiz[current].time_allowed)
            times = finalObj.quiz[current].time_allowed
            console.log("next runs")
            gotoNext()
           return
        }
        let timeLeft = {};

        if (times > 0) {
            timeLeft = {
                minutes: Math.floor((times * 1000 / 1000 / 60) % 60),
                seconds: Math.floor((times * 1000 / 1000) % 60)
            };



            return timeLeft;

        }
    }

    const [quesTimeLeft,setQuesTimeLeft] = React.useState(calculateQuesTime())
   

    useEffect(async() => {
        // console.log(perQuestionTime,"per time")
        const questimer = setTimeout(() => {
            setPerQuestionTime(countRef.current-1)
            setQuesTimeLeft(calculateQuesTime())
        }, 1000);
        const fulltimer = setTimeout(() => {
            setTimeLeftAll(totalTimeRef.current - 1)
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        // console.log(timeLeft, "t")
        setTimeout(() => {
            setQuizEnd(true)
            clearTimeout(fulltimer)
            clearTimeout(questimer)
        }, finalObj.time * 1000+1000);

      
    },[timeleftAll])

    const onClose=()=>{
        if(confirm("Do you want to leave the quiz?")){
           router.push('/')
        }
    }



    return (
        <div>
            {quizEnd ? (<Paper className={classes.root} elevation={4}>
                <Typography variant="h4" component="h4">Quiz has ended</Typography>
                <Typography variant="h5">You Got {userAnswers.filter(Boolean).length} Out Of {questions.length}</Typography>
            </Paper>)
                : (
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                    <FaceModal/>
                    </Grid>
                    <Grid item xs={6}>
                    <Paper className={classes.root} elevation={4}>
                     <div>
                        <Typography component="h5">
                            <LiveHelp />
                            <span className={classes.questionMeta}> Question # {current+1}/{questions.length}</span>
                            <span style={{ float: "right" }}>Total Time Left: <span style={{color:"green"}}>{timeLeft.minutes<10 ? "0"+timeLeft.minutes:timeLeft.minutes}:{timeLeft.seconds<10 ? "0"+timeLeft.seconds:timeLeft.seconds}</span></span><br/>
                            <p style={{ float: "right" }}>Time Left for Question {current+1}: <span style={{color:"red"}}>{quesTimeLeft.minutes<10 ? "0"+quesTimeLeft.minutes:quesTimeLeft.minutes}:{quesTimeLeft.seconds<10 ? "0"+quesTimeLeft.seconds:quesTimeLeft.seconds}</span></p>
                        </Typography>
                        <br/>

                        <hr style={{ marginBottom: "20px" }} />
                        <Typography variant="h6" component="h6">
                            {questions[current].question}
                        </Typography>



                        {questions[current].options.map((v, index) => {
                            return (
                                <div key={index} style={{ marginTop: "5px" }}>
                                    <Radio
                                        onChange={handleChange}
                                        checked={selectedValue === index.toString()}
                                        value={index.toString()}
                                        name="radio-button-demo"
                                        aria-label="A"
                                        id="radio"
                                    />
                                    {v.text && v.text}<br/>
                                    {v.image && <img src={v.image} width={200} height={200}/>}
                                    {v.video && <video width={320} height={240} src={v.video} type="video/mp4" controls={true}/>}
                                    {v.audio && <audio src={v.audio} type="audio/mpeg" controls/>}
                                </div>
                            )
                        })
                        }
                        <div className={classes.footer}>
                            <Grid container>
                            <Grid item>
                            <Button variant="contained" color="secondary" style={{backgroundColor:'red'}} onClick={onClose}>
                                    Close
        </Button>
                            </Grid>
                            <Grid item xs={10}>
                                <Grid container justify="flex-end">
                                <Button variant="contained" color="primary" onClick={onNext}>
                                    Next
        </Button>
        </Grid>
                            </Grid>
                            </Grid>
                        </div>
                    </div>
                </Paper>
                </Grid>
                <Grid item xs={3}>
                    <AudioModal/>
                </Grid>
                </Grid>)}
        </div>
    )
}

Quiz.getInitialProps = async (ctx) => {
    const response = await axios('http://localhost:4000/getquiz',{method:"POST"});
    var finalObj = {time:response.data.module.total_time,quiz:response.data.questions,module:response.data.module}
    return { finalObj }
}