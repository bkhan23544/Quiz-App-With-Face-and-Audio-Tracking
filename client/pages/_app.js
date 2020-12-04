import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import '../styles/style.css'
import styles from '../styles/Home.module.css'
import React,{useState,Fragment,useEffect } from 'react';
import Layout from '../components/Layout';
import {MDBContainer,MDBFooter} from "mdbreact";





export default function MyApp(props) {
  const { Component, pageProps } = props;


  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Quiz App</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous"/>
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
    <Layout/>
        <Component {...pageProps} />
        <div className="footer-copyright text-center py-3" style={{backgroundColor:"#3F51B5",marginTop:"20px",color:"white"}}>
        <MDBContainer fluid>
          &copy; {new Date().getFullYear()} Copyright: Abc
        </MDBContainer>
      </div>
        {/* </Layout> */}
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};