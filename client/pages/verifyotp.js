import React,{useEffect} from 'react'
import OtpInput from 'react-otp-input';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useRouter } from 'next/router'
import { Grid } from '@material-ui/core';
import OTP from 'otp-client'
import axios from 'axios';



const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));


export default function VerifyOtp(){
const [otp,setOtp] = React.useState('')
const [reqOtp,setreqOtp] = React.useState('')
const [tOtp,settOtp] = React.useState('')
const [error,setError] = React.useState(false)
const classes = useStyles();
const router = useRouter()


const handleChange=(e)=>{
    setOtp(e)
}

const sendOtp=async()=>{
    const secret = "TPQDAHVBZ5NBO5LFEQKC7V7UPATSSMFY"
    const options = {
      algorithm: "sha256",
      digits: 4,
      period: 20
    }
     
    const otp = new OTP(secret, options)
    const token = otp.getToken()
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    let params = {email:parsed.email,otp:token}
    var setting = require("../Settings/settings.json")
    let res = await axios.post(`${setting.backend_url}/sendmail`, params);
    setreqOtp(res.data.otp)
    settOtp(res.data.tOtp)
}

useEffect(async()=>{
    sendOtp()
},[])

const handleSubmit=()=>{
  
    if(otp==reqOtp || otp==tOtp){
      const queryString = require('query-string');
  const parsed = queryString.parse(window.location.search);
        setError(false)
router.push(`/face-match?email=${parsed.email}`)
}
else{
    setError(true)
    console.log("wrong")
}
}

const resendOtp=()=>{
    console.log("resent")
}

    return(
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            Verify OTP
          </Typography>

          <OtpInput
          className="mt-4"
                  inputStyle="inputStyle"
                  numInputs={4}
                  hasErrored={error}
                  errorStyle="error"
                  onChange={handleChange}
                  separator={<span>-</span>}
                  isInputNum={true}
                  shouldAutoFocus
                  value={otp}
                />
          <form className={classes.form} noValidate>
              <Grid container justify="center" direction="row">
              
            <Grid>
            <Button
            onClick={handleSubmit}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Verify
            </Button>
            </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={8}>
        </Box>
      </Container>

         

    )

}