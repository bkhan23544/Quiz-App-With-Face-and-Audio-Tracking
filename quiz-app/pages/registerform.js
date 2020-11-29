import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { useRouter } from 'next/router'

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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp(props) {
  const classes = useStyles();
  const router = useRouter()
  const [settings, setSettings] = React.useState({})
  const [fields, setFields] = React.useState({})
  

  


  useEffect(() => {
    // props.setTitle("Face Registration Form")

    var setting = {}
    const queryString = require('query-string');
    const parsed = queryString.parse(window.location.search);
    if (parsed.setting) {
      setting = require("../Settings/" + parsed.setting)
      //setting can be accessed from anywhere in the component
      setSettings(setting)
    }
    else {
      setting = require("../Settings/settings.json")
      setSettings(setting)
      console.log(setting, "settings")
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }
    else {
      //Information about webcam
      navigator.mediaDevices.enumerateDevices()
        .then(function (devices) {
          devices.forEach(function (device) {
            console.log(device.kind + ": " + device.label +
              " id = " + device.deviceId);
          });
        })
        .catch(function (err) {
          console.log(err.name + ": " + err.message);
        });
    }
  },[])

  const handleSubmit=async(e)=>{
    console.log(fields,"fielsa")
    if(fields.firstName && fields.lastName && fields.gender && fields.email && fields.date){
    localStorage.setItem('userData', JSON.stringify(fields))
    var finalObj={
      images:{abc:"aaa"},
      fields:fields
    }
    e.preventDefault()
    router.push("/faceregister")
  }
  else{
    alert("Please Fill All Fields")
  }

  }

  const handleChange = (event) => {
    setFields({ ...fields, [event.target.name]: event.target.value });
  };



  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography justify="center" component="h1" variant="h5">
          General Form
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                onChange={handleChange}
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                onChange={handleChange}
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="lname"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup aria-label="gender" name="gender" onChange={handleChange}>
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={handleChange}
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={handleChange}
                name="date"
                id="date"
                label="Date"
                type="date"
                fullWidth
                defaultValue={() => Date.now()}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
          {/* <Link to="/face"> */}
            <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Submit
          </Button>
          {/* </Link> */}
        </form>
      </div>
      <Box mt={5}>
      </Box>
    </Container>
  );
}