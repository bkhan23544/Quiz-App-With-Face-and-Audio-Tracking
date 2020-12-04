import { Button, CssBaseline, Typography } from '@material-ui/core'
import React, { useEffect } from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import { useRouter } from 'next/router';


const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(20),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%',
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));

export default function StartQuiz({finalObj}){
    const classes = useStyles();
    const router = useRouter()

    const exitQuiz=()=>{
        if(confirm("Do you want to cancel quiz?")){
            router.push('/')
        }
    }

    const handlePush=()=>{
      const queryString = require('query-string');
      const parsed = queryString.parse(window.location.search);
      router.push(`/quiz?email=${parsed.email}`)
    }

    


    return(
        <div>
              <Container component="main" maxWidth="xs" style={{textAlign:"center"}} className="mt-4">
              <Typography variant="h4" component="h2" gutterBottom>
{finalObj.quizdetails.quiz_name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
{finalObj.quizdetails.quiz_instruction}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
Time to attempt: {Math.floor(finalObj.quizdetails.total_time/60)} Minutes
                  </Typography>
          <Button
          onClick={handlePush}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Start Quiz
         </Button>

          <Button
          onClick={exitQuiz}
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            style={{backgroundColor:"red"}}
            className={classes.submit}
          >
            Cancel Quiz
         </Button>
          </Container>
        </div>
    )
}

StartQuiz.getInitialProps = async (ctx) => {
  var setting = require("../Settings/settings.json")
  const response = await axios(`${setting.backend_url}/getquizdetails`,{method:"POST"});
    var finalObj = {quizdetails:response.data}
    return { finalObj }
}