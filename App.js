import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Keyboard } from 'react-native';
import {Provider} from 'react-redux';


import { Icon } from 'react-native-elements'

import store from './redux/store'
import * as actions from './redux/actions';

import Login from './login';
import Register from './register';
import Splash from './splash';
import Main from './main';
import SelectEvent from './selectEvent';
import Summary from './summary';
import Signup from './signup';
import PassReset from './resetPass';


var Parse = require('parse/react-native')

Parse.initialize("mM14bNHZPl0CiOjwJlYTQh27b2Juz3vrvWVqKIY4", "kzmSQrTwI2YbKGXduWYImH5w8VeYdN4xGUauyhjc");
Parse.serverURL = 'https://parseapi.back4app.com';


export default function App() {

  let [initiated, setInitiated] = useState(false)
  let rel_officer = null
  let [regPerson, setRegPerson] = useState(null)
  let [officer, setOfficer] = useState(null)
  let expired = null;
  let tank = null;
  let dailyLogTank;
  let covidteamMember = null


  let fillTank = (income)=>{
    tank = income
  };

  let storeRegPerson = (income)=>{
    setRegPerson(income)
  };
  let setCovidTeamMember = (income)=>{
    
    setOfficer(income)
    rel_officer = income
    covidteamMember = income
  };


let chosenEvent = null
let [selectedEvent, setSelectedEvent] = useState(null)

function fixSelEvent(obj){
  setSelectedEvent(obj)
  chosenEvent  = obj
}

useEffect(()=>{

}, [])

  function clearTanks(){
     tank = null;
     dailyLogTank = null
  }

  let [currentScreen, setCurrentScreen] = useState(<Splash />)

  const clearRegPers =(i)=>{
    setRegPerson(null)
  }
  
  let [isLoggedIn, setIsLoggedIn] = useState(false)
  let [hideNav, setHideNav] = useState(false)
  let [navState, setNavState] = useState(1)

  const gotoDailyLog =async()=>{
    const SittingProfile = Parse.Object.extend("seatAssignmentLog");
    
    const assignedSeats = new Parse.Query(SittingProfile);
    assignedSeats.equalTo("event_id", selectedEvent.get("eventID"));
    
      let date = new Date();
      date.setHours(0,0,0,0);
      let datePlusOne = new Date(date);
      datePlusOne.setDate(datePlusOne.getDate() + 1);
    
    assignedSeats.greaterThanOrEqualTo("date", date);
    assignedSeats.lessThan("date", datePlusOne);
    assignedSeats.include(["personsDetails"])
    assignedSeats.include(["assignedBy"])
    assignedSeats.limit(1000);
    await assignedSeats.find().then(
      function(object) {

        dailyLogTank = object
        changeScreen("Summary")

      },
      function(error) {
        console.log(error)
      });
  }

  const changeScreen = (command)=>{
    setHideNav(false)
    if(command==="Login"){
      setIsLoggedIn(false)
      clearTanks();
      setCurrentScreen(<Login onSetExpiry={(val)=>expired=val} onPassValue={(object)=>fillTank(object)} onPassUser={(object)=>setCovidTeamMember(object)}  onChangeScreen={(order)=>changeScreen(order)}/>)
    }else if(command==="ForgottenPass"){
      setIsLoggedIn(false)
      setCurrentScreen(<PassReset onChangeScreen={(order)=>changeScreen(order)} />)
    }else if(command==="Main"){
      setIsLoggedIn(true)
      setNavState(2)
      setCurrentScreen(<Main expiry={expired} usher={rel_officer} newReg={regPerson} event={!selectedEvent ? chosenEvent : selectedEvent} onPassValue={(object)=>fillTank(object)} onClearNewRegData={(i)=>clearRegPers(i)} onChangeScreen={(order)=>changeScreen(order)}   />)
    }else if(command==="Register"){
      setIsLoggedIn(true)
      setNavState(3)
      setCurrentScreen(<Register usher={officer} onSendData={(a)=>storeRegPerson(a)} onPassUser={(object)=>setCovidTeamMember(object)} event={!selectedEvent ? chosenEvent : selectedEvent} onChangeScreen={(order)=>changeScreen(order)}/>)
    }else if(command==="SelectEvent"){
      setIsLoggedIn(true)
      setHideNav(true)
      setCurrentScreen(<SelectEvent expiry={expired} onHoldEvent={(ev)=>fixSelEvent(ev)} incomingData={tank} usher={rel_officer} onChangeScreen={(order)=>changeScreen(order)}/>)
    }else if(command==="Summary"){
      setIsLoggedIn(true)
      setNavState(1)
      setCurrentScreen(<Summary expiry={expired} usher={officer} incomingData={dailyLogTank} event={!selectedEvent ? chosenEvent : selectedEvent}  onChangeScreen={(order)=>changeScreen(order)}/>)
    }else if(command==="Signup"){
      setIsLoggedIn(false)
      setCurrentScreen(<Signup onChangeScreen={(order)=>changeScreen(order)}/>)
    }

  }


if(initiated === false){
  setTimeout(()=>{

    setInitiated(true);
    setCurrentScreen(<Login onSetExpiry={(val)=>expired=val} onPassValue={(object)=>fillTank(object)} onPassUser={(object)=>setCovidTeamMember(object)} onChangeScreen={(order)=>changeScreen(order)}/>)
    
  }, 5000);
}


const [isOpen, setIsOpen] = useState(false);
const keyboardShowListener = useRef(null);
const keyboardHideListener = useRef(null);

useEffect(() => {
  keyboardShowListener.current = Keyboard.addListener('keyboardDidShow', () => setIsOpen(true));
  keyboardHideListener.current = Keyboard.addListener('keyboardDidHide', () => setIsOpen(false));

  return () => {
    keyboardShowListener.current.remove();
    keyboardHideListener.current.remove();
  }
})
 
const logout = () =>{
  store.dispatch(actions.logout())
  setCovidTeamMember(null)
  changeScreen("Login") 

}


  return (
    <Provider store={store}>
    <View style={styles.container}>
      {/*Header Here*/ }
      {isLoggedIn===true ? 
      <View style={{flex:2, width:"100%"}}>
        <View style={{flex: 2, paddingTop: 40, paddingHorizontal: 40, flexDirection: "row", width:" 100%", backgroundColor:"#007aab", alignContent: "center", alignItems:"center", justifyContent: "center"}}>  

        {(isOpen === false && Platform.OS ==="android") || (Platform.OS ==="ios") ? <View style={{flex:6}}>
            <Text style={{fontSize: 10, color: "#ffffff", textAlign:"left"}}>{!officer ? "" : officer.get("username")} @ {!officer ? "" : officer.get("inst").get("Name").substring(0,35)}..</Text>
          </View> :<View></View>} 
          
          {(isOpen === false && Platform.OS ==="android") || (Platform.OS ==="ios") ? <View style={{flex:1}} >
            <TouchableOpacity onPress={logout}>
            <Icon name='logout-variant' type='material-community' color='#fff'/>
            </TouchableOpacity>
          </View>:<View></View>}
          

        </View>
      </View>: 
      <View></View>}

      {/*Body Here*/ }
      <View style={{flex:13, width:"100%"}}>
          {currentScreen}
      </View>

      {/*Bottom navigation here*/ }
      {isLoggedIn===true && hideNav===false ?
      <View style={{flex:2, width:"100%"}}>
      {isOpen === true && Platform.OS === "android"?<View style={{flex:0}}></View>:
      <View style={{width:"100%", height:100, backgroundColor:"#fff", alignSelf:"center", justifyContent:"center", flexDirection:"row", paddingHorizontal:10, paddingTop:5}}>
      <TouchableOpacity onPress={()=>{navState !==1 ? gotoDailyLog():{}}}  style={{...styles.shadow, width:50, height:50, borderRadius:25, backgroundColor:navState!==1? "#fff":"#007aab", borderWidth:1, borderColor:navState!==1? "#007aab":"#fff", marginHorizontal:20, alignItems:"center", justifyContent:"center"}}>
        <Icon name='file-table-outline' type='material-community' color={navState!==1? "#007aab":"#fff"}/>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>{navState !==2 ?changeScreen("Main"):{}}} style={{...styles.shadow, marginBottom:20, width:70, height:70, borderRadius:35, backgroundColor: navState!==2? "#fff":"#007aab", borderWidth:1, borderColor:navState!==2? "#007aab":"#fff", marginHorizontal:30, alignItems:"center", justifyContent:"center"}}>
            <Icon name='seat-outline' size={40} type='material-community' color={navState!==2? "#007aab":"#fff"} />
        </TouchableOpacity>
      <TouchableOpacity onPress={()=>{navState !==3 ? changeScreen("Register"):{}}} style={{...styles.shadow, width:50, height:50, borderRadius:25, backgroundColor: navState!==3? "#fff":"#007aab", borderWidth:1, borderColor:navState!==3? "#007aab":"#fff", marginHorizontal:20, alignItems:"center", justifyContent:"center"}}>
        <Icon name='account-plus-outline' type='material-community' color={navState!==3? "#007aab":"#fff"}/>
      </TouchableOpacity>
      </View>}
      </View> : 
      <View></View> }
      
      

      <StatusBar style="auto" />
    </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow:{
    shadowColor: '#8f8f8f',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 1,
    shadowOpacity: 8.0,
    elevation:3
  }
});
