
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import styles from '../styles/Home.module.css'
import React,{useState,Fragment,useEffect } from 'react';
import { useRouter } from 'next/router'
import { withStyles,useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import HomeIcon from '@material-ui/icons/Home';
import ReceiptIcon from '@material-ui/icons/Receipt';
import Typography from '@material-ui/core/Typography';
import {MDBContainer,MDBFooter} from "mdbreact";



const drawerWidth = 240;

const styles1 = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flex: 1
  },
  drawerPaper: {
    position: "absolute",
    width: drawerWidth
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  toolbarMargin: theme.mixins.toolbar,
  aboveDrawer: {
    zIndex: theme.zIndex.drawer-1
  }
});




const MyToolbar = withStyles(styles1)(
  ({ classes, title, onMenuClick }) => (
    <Fragment>
      <AppBar className={classes.aboveDrawer}>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={onMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            color="inherit"
            className={classes.flex}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      {/* <div className={classes.toolbarMargin} /> */}
    </Fragment>
  )
);

const MyDrawer = withStyles(styles1)(
  ({ classes, open, onClose, onItemClick,theme,setTitle }) => (
<div>

<CssBaseline />
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          onClose={onClose}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={onClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider />
          <List>
          <ListItem button key={"Home"} onClick={()=>onItemClick('Home',"/")}>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={"Home"} />
              </ListItem>
              <ListItem button key={"Face Registration"} onClick={()=>onItemClick('Face Registration',"/registerform")}>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary={"Face Registration"} />
              </ListItem>
              <ListItem button key={"Start Quiz"} onClick={()=>onItemClick('Start Quiz',"/quizform")}>
                <ListItemIcon><ReceiptIcon /></ListItemIcon>
                <ListItemText primary={"Start Quiz"} />
              </ListItem>
            
          </List>
        </Drawer>
  <div className="footer-copyright text-center py-3" style={{backgroundColor:"#3F51B5",marginTop:"20px",color:"white"}}>
        <MDBContainer fluid>
          &copy; {new Date().getFullYear()} Copyright: Abc
        </MDBContainer>
      </div>
    </div>

  ))

  export default function Layout(){
    const router = useRouter()
    const [drawer, setDrawer] = useState(false);
    const [title, setTitle] = useState('');
    const theme = useTheme();
    
useEffect(()=>{
    if(router.pathname=='/registerform' || router.pathname=='/face-register'){
        setTitles('Face Registration')
    }
    else if(router.pathname=='/quizform' ||router.pathname=='/verifyotp' ||router.pathname=='/face-match' ||router.pathname=='/startquiz'){
        setTitles('Start Quiz')
    }
    else if(router.pathname=='/quiz'){
        setTitles('Quiz')
    }
    else if(router.pathname=='/'){
        setTitles('Home')
    }
})

  
    const setTitles=(titles)=>{
        setTitle(titles)
      }
    
     
    
      const onItemClick = (title,route) => {
        setTitles(title)
        setDrawer(drawer);
        setDrawer(!drawer);
        router.push(route)
        
      };
    
      const toggleDrawer = () => {
        setDrawer(!drawer);
      }
return(
    <div>
    <MyToolbar title={title} onMenuClick={toggleDrawer} />
    <MyDrawer
      open={drawer}
      onClose={toggleDrawer}
      onItemClick={onItemClick}
      theme={theme}
      setTitle={setTitles}
    />
    </div>
)    
  
  }
