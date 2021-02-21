import React, {useState, useEffect} from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-kit-react/views/testListPage.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Reset from '@material-ui/icons/Restore'
import Header from "components/Header/Header.js";
import Footer from "components/Footer/Footer.js";
import { Container, Box, CardContent, Card, Grid, Checkbox, FormControlLabel, Button } from "@material-ui/core";
import firebase from 'firebase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles(styles);
const dashboardRoutes = [""];

var firebaseConfig = {
    apiKey: "AIzaSyB0-p8JD6DSLIXqNh-OphPz7ARwB1nKZ1Y",
    authDomain: "notedown-a622f.firebaseapp.com",
    databaseURL: "https://notedown-a622f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "notedown-a622f",
    storageBucket: "notedown-a622f.appspot.com",
    messagingSenderId: "211973859099",
    appId: "1:211973859099:web:50acbc3fb789f9e204d5be",
    measurementId: "G-TRWL5RDTNF"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default function TestListPage(props){
    const { ...rest } = props;
    const classes = useStyles();
    const [testList, updateTestList] = useState([]);
    const [topics, updateTopics] = useState([]);
    useEffect(()=>{
        async function fetchData(){
          var items = await getDataFromDB();
          var topics=[];
          items.forEach((item)=>{
              if(topics.indexOf(item['questions'][0]['topic'].toUpperCase())==-1)
              topics.push(item['questions'][0]['topic'].toUpperCase());
          });
          updateTestList([...items]);
          updateTopics([...topics]);
        }
        fetchData()
      },[]);
      async function getDataFromDB(){
        const db = firebase.firestore();
        var items =[];
        await db.collection("tests").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
        });
        return items;
    }
    return (
        <div>
        <Header
                color="primary"
                routes={dashboardRoutes}
                brand="TestOn.live"
                changeColorOnScroll={{
                    height: 400,
                    color: "white"
                }}
                {...rest}
        />
        <div className={classes.container}>
            <Container style={{"height":"50px"}}/>
            <Grid container spacing={2} direction-xs-row-reverse>
            <Grid item sm={9} xs={12}>
            <List className={classes.center}>
              {testList.map((item)=>(
                 <ListItem key={item.testId}>
                 <Card style={{"minWidth":"100%", "height":"50px", "justifyContent":"center"}}>
                 <CardContent>
                        <ListItemText primary={item.testName} />
                        </CardContent>
                        </Card>
                    </ListItem>
                ))}
            </List>
            </Grid>
            <Grid item xs={12} sm={3}>
                <TestListFilters topics={topics} tests={testList} updateTests={updateTestList} getDataFromDB={getDataFromDB}/>
            </Grid>
            </Grid> 
        </div>
        <Footer/> 
        </div>
    );
}

function TestListFilters(props){
    function initializeChecks(){
        var checked = {};
        props.topics.forEach((item)=>{
            checked[item] = false;
        });
        console.log(checked);
        return checked;
    }
    const[checkedState, updateChecked] = useState(initializeChecks());
    function handleChange(e){
        console.log(checkedState);
        // let newChecked = checkedState;
        // // console.log(newChecked);
        // newChecked[e.target.name] = e.target.checked;
        // updateChecked([...newChecked]);
        // updateTestList();
    }
    function isSelected(){
        for(var prop in checkedState){
            if(checkedState[prop]){
                return true;
            }
        }
        return false;
    }
    async function updateTestList(){
        var newTests=[];
        if(isSelected()){
            var allTests = await props.getDataFromDB();
            allTests.forEach((item)=>{
                if(checkedState[item['questions'][0]['topic'].toUpperCase()]){
                    newTests.push(item);
                }
            });
            props.updateTests([...newTests]);       
        }else{
            resetTestList();
        }
    }
    async function resetTestList(){
        var items = await props.getDataFromDB();
          props.updateTests([...items]);
    }

    useEffect(()=>{
        async function fetchData(){
          var items = await props.getDataFromDB();
          props.updateTests([...items]);
        }
        fetchData()
      },[checkedState]);

      function resetFilters(){
          resetTestList();
          console.log(checkedState);
          var localState= checkedState;
          for(var prop in localState){
                localState[prop] = false;
          }
          updateChecked([...localState]);
      }
    return (
    <Grid container spacing={1}>
        {props.topics.map((item)=>(
            <Grid item xs={12} > 
            
            <FormControlLabel
                control={
                <Checkbox
                    name={item}
                    checked={checkedState[item]}
                    onChange={handleChange}    
                />
            }
            label={item}
            /></Grid>
        ))}
        <Grid item xs={12}>
            <Button variant="text" startIcon={<Reset/>} onClick={resetFilters}>
                Reset Filters
            </Button>
        </Grid>
    </Grid>
    );
}