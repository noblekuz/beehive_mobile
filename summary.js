import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, Text, TextInput, View, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator, Modal, FlatList, Keyboard, ToastAndroid, Platform, AlertIOS, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import * as Print from 'expo-print';
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
//import * as FileSystem from 'expo-file-system';

import {useSelector, useDispatch} from 'react-redux';
import * as actions from './redux/actions';


var Parse = require('parse/react-native')

Parse.initialize("APP_KEY", "API_KEY");
Parse.serverURL = 'https://parseapi.back4app.com';



export default function Summary(props) {

  const reduxStore = useSelector(state => state)
  const dispatch = useDispatch();

  let [isLoading, setIsLoading] = useState(false);
 
  //console.log("-------Redux--------")
  //console.log(reduxStore.selectedEventsDetails.state.state.state.selectedEvent)



useEffect(()=>{

}, [])



  let [custEventID, setCustomEventID] = useState("")
  const idInputHandler = (query) =>{
    setCustomEventID(query)
  }

  let [eventDate, setEventDate] = useState("")
  const eventDateInputHandler = (date) =>{
    setEventDate(date)
  }

  let [officer, setOfficer] = useState(reduxStore.userDetails.state.state.user)


  useEffect(()=>{
    //AsyncStorage.getItem('@userDetails', (err, item) => setCovidTeamMember(JSON.parse(item)));
  }, [])



let [selectedEvent, setSelectedEvent] = useState(null);


let [todayLog, setTodayLog] = useState(props.incomingData);

//let [inst, setInst] = useState(!props.usher.get("inst")? officer.get("inst"):props.usher.get("inst"));
let [inst, setInst] = useState(reduxStore.instDetails.state.institution);
let [defaultEvent, setDefaultEvent] = useState(props.event);



const getCovidTeamMemberDetails =async()=>{

    const User = Parse.Object.extend("User");
    const user = new Parse.Query(User);
    user.equalTo("objectId", officer.id);
        
    await user.first().then(
        function(object) {
          // the object was found
          setOfficer(object);
          
        },
        function(error) {
          console.log(error)
        });

}

useEffect(()=>{
  //getInstDetails();
  //getCovidTeamMemberDetails()
}, [])





let [isExpired, setIsExpired] = useState(inst.get("nextExpiry") < new Date ())



let attendantsRes
let [retrieved, setRetrieved] = useState()



let [custEvent_name, setCustEventName] = useState(null)
let [custEvent_date, setCustEventDate] = useState(null)
let [custEvent_id, setCustEvent_id] = useState(null)



const downloadDailyLog = async()=>{

  let tableString = "<table><tr>";
  tableString += `<td>No.</td>`;
  tableString += `<td>Person's ID</td>`;
  tableString += `<td>Fullname</td>`;
  tableString += `<td>Phone Number</td>`;
  tableString += `<td>Address</td>`;
  tableString += `<td>Seat No.</td>`;
  tableString += `<td>Assigned by</td>`;
  tableString += "</tr><tr>";

  for (var i=0; i<todayLog.length; i++) {
   
    tableString += `<td>${i+1}</td>`;
    tableString += `<td>${todayLog[i].get("personsDetails").get("userId").substring(3)}</td>`;
    tableString += `<td>${todayLog[i].get("personsDetails").get("fullName")}</td>`;
    tableString += `<td>${todayLog[i].get("personsDetails").get("phone")}</td>`;
    tableString += `<td>${todayLog[i].get("personsDetails").get("address")}</td>`;
    tableString += `<td>${todayLog[i].get("seatNumber")}</td>`;
    tableString += `<td>${todayLog[i].get("assignedBy").get("personalID").substring(3)}</td>`; 
    tableString += "</tr><tr>";
    
  }

  
  

  
  let fileEncoder = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BeeHive Generated Log</title>
        <style>
            body {
                font-size: 12px;
                color: rgb(0, 0, 0);
            }
            h1 {
                text-align: center;
                font-size: 18px;
            }
            h2 {
                text-align: center;
                font-size: 16px;
            }
            h3 {
                text-align: center;
                font-size: 14px;
                margin-bottom: 25px;
            }
            p {
                text-align: lefts;
                font-size: 10px;
            }
            p2 {
                text-align: center;
                font-size: 8px;
            }
            table, th, td {
              border: 1px solid black;
              border-collapse: collapse;
            }
            p3 {
                text-align: center;
                font-size: 6px;
            }
            @page {
              margin: 20px;
            } 
        </style>
    </head>
    <body>
        <h1>${inst.get("Name")}, ${inst.get("city")}</h1>
        <h2>${!custEvent_name? props.event.get("eventName"): custEvent_name} (Event ID: ${!custEvent_id ? props.event.get("eventID"):custEvent_id})</h2>
        <h3>Event Date: ${!custEvent_date ? moment().format('ll'): custEvent_date}            Total Persons: ${todayLog.length}</h3>
        <p>${tableString}</p>
        <br>
        <p2>Log generated at Request of ${officer.get("username")} ${officer.get("lastName")} (${officer.get("personalID")}), ${officer.get("email")} on ${moment().format('llll')}</p2>
        <br>
        <p3>beehive.orbitag.net</p3>
    </body>
    </html>
`;

  try {

   
    let filePath = await Print.printToFileAsync({
      html: fileEncoder,
      width : 612,
      height : 792,
      base64 : false
    });

    if (Platform.OS === "ios") {
      await Sharing.shareAsync(filePath.uri);
    } else {
      
      /* const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status==="granted") {
        
        ToastAndroid.show("Downloading log..", ToastAndroid.SHORT)
        await Sharing.shareAsync(filePath.uri);
        
      }else {

        ToastAndroid.show("Permission denied", ToastAndroid.SHORT)
        permission = await MediaLibrary.requestPermissionsAsync();
        
      } */
      ToastAndroid.show("Compiling log..", ToastAndroid.SHORT)
      await Sharing.shareAsync(filePath.uri);
    }

  }catch (error) {
    console.error(error);
  }


    
  

}


const hideModal =()=>{
  setSetLogmodal(false)
  setCustomEventID("")
  setEventDate("")
  setIsLoading(false)
}

const [setLogModal, setSetLogmodal] = useState(false)

const loadLog =async()=>{

  if(custEventID ===""){
    if (Platform.OS === 'android') {
      ToastAndroid.show("Please enter event ID", ToastAndroid.SHORT)
    } else {
      Alert.alert("Warning", "Please enter event ID");
    }
  }else if(eventDate ===""){
    if (Platform.OS === 'android') {
      ToastAndroid.show("Please enter event date", ToastAndroid.SHORT)
    } else {
      Alert.alert("Warning", "Please enter event date");
    }
  }else if(custEventID!=="" && eventDate!==""){
    setIsLoading(false)
     let checkDate =  new Date(eventDate)
     if (isNaN(checkDate.getTime())) {  
      Alert.alert("Warning", "Invalid Date. Please check date format");
      setIsLoading(false)
      
    } else {
      setIsLoading(true)
        //Checking existence of Event
        const seatAssignmentLog = Parse.Object.extend("seatAssignmentLog");
        const seatAssLog = new Parse.Query(seatAssignmentLog);
        seatAssLog.equalTo("instId", inst);
        seatAssLog.equalTo("event_id", custEventID);
        let res = seatAssLog.first().then(
          function(foundEvent) {
            if(!foundEvent){
              setIsLoading(false)
              Alert.alert("Done", "Can't find Event with ID: " + custEventID);
            }else{
              const SittingProfile = Parse.Object.extend("seatAssignmentLog");
              const assignedSeats = new Parse.Query(SittingProfile);
              assignedSeats.equalTo("event_id", custEventID);
              assignedSeats.equalTo("instId", inst);
              
                let date = new Date(eventDate);
                date.setHours(0,0,0,0);
                let datePlusOne = new Date(date);
                datePlusOne.setDate(datePlusOne.getDate() + 1);
              
              assignedSeats.greaterThanOrEqualTo("date", date);
              assignedSeats.lessThan("date", datePlusOne);
              assignedSeats.include(["personsDetails"])
              assignedSeats.include(["assignedBy"])
              assignedSeats.limit(1000);
              assignedSeats.find().then(
                function(seatlogs) {
                  if(seatlogs.length >0){
                    Alert.alert("Done",  seatlogs.length+" assignments found for "+ custEventID);
                    setTodayLog(seatlogs)
                    setIsLoading(false)
                    hideModal()

               
                    for (var i = 0; i < 1; i++) {
                      setCustEventName(!seatlogs[i].get("eventName")?"Unknown Event":seatlogs[i].get("eventName")) 
                      setCustEventDate(moment(eventDate).format('ll'))
                      setCustEvent_id(seatlogs[i].get("event_id"))
                    }

                  }else{
                    Alert.alert("Done",  seatlogs.length+" assignments found for "+ custEventID);
                    setTodayLog([])
                    setIsLoading(false)
                    hideModal() 
                  }
                  setIsLoading(false) 
                },
                function(error) {
                  Alert.alert("Done",  "Error retieving data for "+ custEventID+ ". Please contact Service Providers");
                  setTodayLog([])
                  setIsLoading(false)
                  hideModal()
                  
                  console.log(error)
                });
              
            }
                                          
          },
            function(error) {
            
            Alert.alert("Warning", "Error in finding Event");
            setIsLoading(false)
          
          })


    }

  }

    
  
}

const loadCurrentEventLog = () =>{
  setTodayLog(props.incomingData)
  setCustEventName(null)
  setCustEventDate(null)
  setCustEvent_id(null)
}


const turnOnModal = () =>{
  if(isExpired === true){
    Alert.alert("Expired Usage Plan","Sorry! You need to renew your institution's plan to use this service. Visit beehive.orbitag.net")
  }else{
    setSetLogmodal(true)
  }   
}


  return (
    <View style={styles.container}>

       <View style={{flex:14, backgroundColor:"#fff", borderRadius:20, flexDirection:"column", alignContent: "center", paddingTop:20, paddingBottom:10, paddingHorizontal:10}}>
        <View style={{flex:1, alignSelf:'center', marginBottom:40, paddingBottom:10}}>
            <Text style={{color:'#454545', fontSize:16, textAlign:'center'}}>{!custEvent_name? defaultEvent.get("eventName"): custEvent_name}</Text>
            <Text style={{color:'#6e6e6e', fontSize:14, textAlign:'center', marginTop: 12}}>{inst.get("Name")}, {inst.get("city")}</Text>
            <Text style={{color:'#6e6e6e', fontSize:12, textAlign:'center', marginTop: 8}}>Event ID: {!custEvent_id ? defaultEvent.get("eventID"):custEvent_id} :: Date: {!custEvent_date ? "Today "+moment().format('ll'): custEvent_date}</Text>
         
            <Text style={{color:'#050303', fontSize:12, textAlign:'center', marginVertical: 12}}>Total Assignment: {todayLog.length}</Text>
        </View>

        <Modal visible={setLogModal} style={{height: '100%', width:'100%' }} animationType='slide' transparent={true}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{width:"100%", height:"100%"}}>
                        <View style={{backgroundColor: 'rgba(52, 52, 52, 0.8)', width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
                        
  
                            <View style={{width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignSelf: 'center'}}>
                                <Text style={{fontSize: 20, color: '#292929'}}>Custom event Log</Text>
                              

                            {/* koliko */}

                              
                                <View style={{width: '100%', marginBottom: 10}}>                         
                                    <Text style={{fontSize: 12, color:'#6b6b6b', marginTop:10}}>Fill in event details</Text>                        
                                </View>

                               
                                      <View style={{backgroundColor:'#cccccc', width: "100%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginTop:10}}>
                                        <TextInput 
                                        style={{fontSize:16}}
                                        placeholder={"Event ID"}
                                        onChangeText={idInputHandler}
                                        value={custEventID}/>
                                      </View>
                                      <View style={{ backgroundColor:'#cccccc', width: "100%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
                                        <TextInput 
                                        style={{fontSize:16}}
                                        placeholder={"Event Date (YYYY-MM-DD)"}
                                        onChangeText={eventDateInputHandler}
                                        value={eventDate}/>
                                      </View>
                   
                         
                                

                                
                                <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 30}}>

                                        <TouchableOpacity style={{
                                                width: 120,
                                                height: 40,
                                                backgroundColor: '#ffffff',
                                                borderWidth: 1,
                                                borderColor: "#570607",
                                                borderRadius: 20,
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 10,


                                            }} onPress={hideModal}><Text style={
                                                {color:"black",
                                                fontSize: 14,
                                                alignSelf: 'center'}}>Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity  onPress={loadLog} style={{
                                                width: 120,
                                                height: 40,
                                                backgroundColor: "#0688c9",
                                                borderRadius: 20,
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 10,
                                                flexDirection:"row",
                                                paddingHorizontal:10
                                            }}><Text style={{color:'#ffffff', fontSize: 14, alignSelf: 'center'}}>Find Log</Text>
                                            {isLoading === true ? <View style={{alignSelf:"center"}}><ActivityIndicator size="small" color="#fff" /></View>:<View></View>}
                                            </TouchableOpacity> 
                                    </View>
                            </View>
                        </View>
                        </TouchableWithoutFeedback>
                    </Modal>
        
        {officer.get("acc_type")===2? 
        <View style={{flex:1, alignSelf:'center', width:"100%", marginVertical: 20, flexDirection: "row", alignContent:"space-around"}}>
            
            <TouchableOpacity style={{flex: 3, backgroundColor: "#fff", borderWidth:1, borderColor:"#0688c9", height: 40, borderRadius: 20, justifyContent: "center", alignContent: "center" }}
               onPress={()=>{turnOnModal()}}>
              <Text style={{fontSize: 13, color: "#0688c9", textAlign: "center"}}>Different Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{flex: 3, backgroundColor: "#0688c9", height: 40, borderRadius: 20, marginHorizontal:5, justifyContent: "center", alignContent: "center" }}
               onPress={loadCurrentEventLog}>
              <Text style={{fontSize: 13, color: "#fff", textAlign: "center"}}>This Event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{flex: 3, backgroundColor: "#32a852", height: 40, borderRadius: 20, justifyContent: "center", alignContent: "center" }}
               onPress={downloadDailyLog}>
              <Text style={{fontSize: 13, color: "#fff", textAlign: "center"}}>Download Data</Text>
            </TouchableOpacity>
            
        </View> : 
        <View></View>}
       
        <View style={{backgroundColor:"#fff", flex: 8, borderRadius: 15, marginTop: 10, borderWidth:1, borderColor:"#d1d1d1", padding:10, borderStyle:"dashed"  }}>
          
            {!todayLog || todayLog.length ===0 ? <View><Text style={{textAlign: "center", fontSize: 14}}>No seat has been Assigned in this Event</Text></View>:
            <View style={{alignContent:"center", alignItems: "center"}}>      
                <FlatList
                  style={{height: '100%', width: '100%', marginHorizontal: 10 }}
                  data = {todayLog}
                  key={() => {new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString()}}
                  renderItem={({item}) => (
                      <View style={{backgroundColor:item === selectedEvent? "#fff4db":"#fff", width:'100%', height: 60, flexDirection: 'row', borderBottomColor: '#cfcfcf', borderBottomWidth:1, paddingVertical: 10, alignContent:"center", alignItems:"center"}}>               
                        <View style={{justifyContent: 'center', flex: 7, marginHorizontal: 15}}>
                          <Text>{item.get("personId").substring(3)}</Text>
                          <Text style={{fontSize:10, color:"#6b6b6b"}}>{!item.get("personsDetails").get("fullName") ? "Deleted Person" : item.get("personsDetails").get("fullName")}</Text>
                         </View>
                                 
                      <View style={{justifyContent: 'center', flex: 3}}>
                          <Text style={{color:"#696969", fontSize:12}} >Seat: {item.get("seatNumber")}</Text>
                       </View>
                                
                    </View>
              
                 )}
              /> 

            </View> }
                         

       

        </View>

        
         


      </View>
     
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});