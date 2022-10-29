//import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState, useRef} from 'react';
import { StatusBar, ActivityIndicator, StyleSheet, Text, TextInput, View, TouchableOpacity, ImagePropTypes, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Platform } from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as actions from './redux/actions';



var Parse = require('parse/react-native')

Parse.initialize("mM14bNHZPl0CiOjwJlYTQh27b2Juz3vrvWVqKIY4", "kzmSQrTwI2YbKGXduWYImH5w8VeYdN4xGUauyhjc");
Parse.serverURL = 'https://parseapi.back4app.com';



export default function Main(props) {
  const reduxStore = useSelector(state => state)
  const dispatch = useDispatch();

let [isLoading, setIsLoading] = useState(false);

/* console.log("-------Redux--------")
console.log(reduxStore.userDetails.state.state.state.user) */



  let [userID, setUserID] = useState(props.newReg ? props.newReg.get("userId").substring(3) : "")
  const idInputHandler = (query) =>{
    let a = ""+query
    setUserID(a)
  }

  let [seat, setSeat] = useState("")
  const seatNoInputHandler = (seat) =>{
    setSeat(seat)
  }


  //let [thisEvent, setThisEvent] = useState(!props.event?null:props.event)
  let [thisEvent, setThisEvent] = useState(props.event)
  let [officer, setOfficer] = useState(reduxStore.userDetails.state.state.user)



  const getCovidTeamMemberDetails =async()=>{

    //console.log(props.usher.id)
  
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
   // AsyncStorage.getItem('@userDetails', (err, item) => setCovidTeamMember(JSON.parse(item)));
   // getCovidTeamMemberDetails()
  }, [])

 

let [inst, setInst] = useState(reduxStore.instDetails.state.institution);

let [isExpired, setIsExpired] = useState(inst.get("nextExpiry") < new Date ())


let attendantsRes
let [retrieved, setRetrieved] = useState()


const searchAttendant =async()=>{

  if(userID ===""){
    Alert.alert("Missing Entry", "Please enter user ID or Phone Number")
    setRetrieved(null)
  }else if(userID !== ""){
    setIsLoading(true)
    const AttendantsData = Parse.Object.extend("AtendantsData");
    const attendantsID = new Parse.Query(AttendantsData);
    let q1 = attendantsID.equalTo("userId", uidPrefix()+userID);
    
    const attendantsPhone = new Parse.Query(AttendantsData);
    let q2 = attendantsPhone.equalTo("phone", userID);

    const mainQuery = Parse.Query.or(q1, q2);

    attendantsRes = await mainQuery.first().then(function(d){
      setIsLoading(false)
      setRetrieved(d);

      if(!d){
        setIsLoading(false)
        Alert.alert("No person found", "Your Entry isnt registered")
      }

    }, function(err){
      setRetrieved(null)
      console.log(err)
    })
    //setRetrieved(attendantsRes);

  }



}

function uidPrefix(){
  let str = !inst ? "Unknown" : inst.get("Name")
    let matches = str.match(/\b(\w)/g);
    var acronym = matches.join(''); 
    let trimed = acronym.substring(0,3);

    return trimed
}



const assignSeat =async()=>{

  if(!retrieved){

  }else if(retrieved){
    if(seat === ""){
      alert('Please Enter Seat Number')
    
    }else if(seat !==""){
      setIsLoading(true)
      const SittingProfile = Parse.Object.extend("seatAssignmentLog");

      // seach if person is already assigned
      //check if seat has been assigned to another person
      
      const assignedSeats = new Parse.Query(SittingProfile);
      assignedSeats.equalTo("event_id", thisEvent.get("eventID"));
      
        let date = new Date();
        date.setHours(0,0,0,0);
        let datePlusOne = new Date(date);
        datePlusOne.setDate(datePlusOne.getDate() + 1);
      
      assignedSeats.greaterThanOrEqualTo("date", date);
      assignedSeats.lessThan("date", datePlusOne);
      assignedSeats.equalTo("seatNumber", seat);
      assignedSeats.include(["personsDetails"])

      await assignedSeats.first().then(function(res){

          if(res){
            setIsLoading(false)
            Alert.alert('Conflict', 'Seat number ' +seat+ ' has already been assigned to '+ res.get("personsDetails").get("fullName"))
          }else if (!res){
            const attendantSeat = new Parse.Query(SittingProfile);
            attendantSeat.equalTo("event_id", thisEvent.get("eventID"));
              let today = new Date();
              today.setHours(0,0,0,0);
              let moro = new Date(today);
              moro.setDate(moro.getDate() + 1);
            attendantSeat.greaterThanOrEqualTo("date", today);
            attendantSeat.lessThan("date", moro);
            attendantSeat.equalTo("personId", retrieved.get("userId"));

            attendantSeat.first().then(function(att){
              if(att){
                setIsLoading(false)
                Alert.alert('Double Assignment', att.get("personsDetails").get("fullName")+" has already been assigned Seat "+ att.get("seatNumber")+" Enter a different seat number")
                setSeat("")
                setRetrieved(null)
              }else if(!att){


                  //console.log("Free to give Seat")
                  const sittingProf = new SittingProfile();

                  sittingProf.set("personId", retrieved.get("userId"));
                  sittingProf.set("personsDetails", retrieved);
                  sittingProf.set("seatNumber", seat);
                  sittingProf.set("date", new Date());
                  sittingProf.set("assignedBy", officer);
                  sittingProf.set("instId", inst);
                  sittingProf.set("event_id", thisEvent.get("eventID"));
                  sittingProf.set("eventName",thisEvent.get("eventName"));
                  
          
                  sittingProf.save().then((assigned) => {
                      setIsLoading(false)
                      Alert.alert("Success",'Seat number ' +seat+ ' assigned to '+ retrieved.get("fullName"))
                      setRetrieved(null);
                      setSeat("")
                      setUserID("")

                      props.onClearNewRegData("clear")
                      
                   
                    //koliko
                  }, (error) => {
                    setIsLoading(false)
                    alert('Failed to assign seat, because: ' + error.message);
                  });
              }
            },function(err){
              setIsLoading(false)
              Alert.alert("Server Error", err)
            })

          }
        
      }, function(err){
        setIsLoading(false)
        Alert.alert("Server Error", err)
      })
           
    }

  }
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




const returnToEvent =()=>{

  const Events = Parse.Object.extend("events");
  const events = new Parse.Query(Events);
  events.equalTo("institution", inst);
  if(isExpired === true){events.limit(1)} 
  let res = events.find().then(
    function(objecto) {
    
      
     props.onPassValue(objecto)
    
     setIsLoading(false)
     props.onChangeScreen("SelectEvent") 
     //return objects
   
    },
    function(error) {
      setIsLoading(false)
      console.log(error)
    })

  
}

  return (
    <View style={{width:"100%", height:"90%"}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{width:"100%", justifyContent:"center", alignContent: "center"}}>
        <View style={{width:"100%", height:"100%"}}>
        
      
      
       <View style={{flex:16, width:"100%", backgroundColor:"#fff", flexDirection:"column", justifyContent:"center", alignContent: "center", paddingVertical:20, paddingHorizontal:10}}>

       {isOpen === true && Platform.OS==="androi"?<View></View>:<View style={{flex:1, alignSelf:'center', marginBottom:30}}>
            <Text style={{color:'#454545', fontSize:20, textAlign:'center', marginBottom:10}}>{thisEvent.get("eventName")}</Text>
            <Text style={{color:'#adadad', fontSize:16, textAlign:'center'}}>Event ID: {thisEvent.get("eventID")}</Text>
        </View>}
        
        
        <View style={{flex:2, alignSelf:'center', width:"100%", marginBottom: 20, flexDirection: "row"}}>
            <View style={{backgroundColor:'#cccccc', borderTopLeftRadius: 25, borderBottomLeftRadius: 25, height:50, justifyContent: 'center', paddingHorizontal: 20, marginVertical:10, flex:8}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Enter person's ID/Phone.."}
              onChangeText={idInputHandler}
              keyboardType={'numeric'}
              value={userID}/>
            </View>
            <TouchableOpacity style={{flex: 3, backgroundColor: "#007aab", height: 50, borderTopRightRadius: 25, marginVertical:10, borderBottomRightRadius: 25, justifyContent: "center", alignContent: "center" }}
            onPress={searchAttendant}>
              <Text style={{fontSize: 14, color: "#fff", textAlign: "center"}}>Search</Text>
            </TouchableOpacity>
        </View>
        <View style={{flex: 10, width:"100%", marginBottom:20}}>
        {isLoading === true ? <View style={{flex:1, alignSelf: "center"}}><ActivityIndicator size="small" color="#0a4a5c" />
        <Text style={{fontSize:10, color:'#0a4a5c', marginVertical:10 }}>Connecting..</Text></View> : <View></View>}
        <View style={{backgroundColor:"#fff", width:"100%", borderRadius: 15, marginTop: 20, borderWidth:1, borderColor:"#d1d1d1", padding:10, borderStyle:"dashed"  }}>
          <View style={{backgroundColor:!retrieved ? "#ffeded" : "#caffba", width:"100%", height: "100%", borderRadius: 15, padding:10  }}>
            
            {!retrieved ? <View>
              <Text style={{fontSize: 24, color:"#2b1717", marginBottom: 10, textAlign:"center"}}>No Person found</Text>
              <Text style={{fontSize: 16, color:"#2b1717", marginBottom: 10, textAlign:"center"}}>Either search for user or Register new person</Text>
            </View>:  <View style={{width: "100%"}}>
              <Text style={{fontSize: 18, color:"#4f4f4f", marginBottom: 10}}>Name: {retrieved.get("fullName")}</Text>
              <Text style={{fontSize: 18, color:"#4f4f4f", marginBottom: 10}}>Phone: {retrieved.get("phone")}</Text>
              <Text style={{fontSize: 18, color:"#4f4f4f", marginBottom: 10}}>Address: {retrieved.get("address")}</Text>
              <Text style={{fontSize: 18, color:"#4f4f4f"}}>User ID: {retrieved.get("userId").substring(3)}</Text>
            </View>}
           
            

            {!retrieved ? <View style={{flex:1, alignSelf:'center', width:"100%", marginTop: 10}}>
             
              <TouchableOpacity style={{backgroundColor: "#018008", height: 50, borderRadius: 25, marginBottom: 10, justifyContent: "center", alignContent: "center" }}
              onPress={()=>{props.onChangeScreen("Register")}}>
                <Text style={{fontSize: 14, color: "#fff", textAlign: "center"}}>Register New Person</Text>
              </TouchableOpacity>
          
              
              <TouchableOpacity style={{ backgroundColor: "#454545", height: 50, marginTop: 10, borderRadius: 25, justifyContent: "center", alignContent: "center" }}
              onPress={returnToEvent}>
                <Text style={{fontSize: 14, color: "#fff", textAlign: "center"}}>Event List</Text>
              </TouchableOpacity> 
            </View> : <View></View>}

          </View>

        </View></View>

        {!retrieved ? <View style={{flex:0}}></View> : <View style={{flex:2, alignSelf:'center', width:"100%", marginBottom: 20, flexDirection: "row"}}>
        
            <View style={{backgroundColor:'#cccccc', borderTopLeftRadius: 25, borderBottomLeftRadius: 25, height:50, justifyContent: 'center', paddingHorizontal: 20, marginVertical:10, flex:6}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Enter seat number.."}
              onChangeText={seatNoInputHandler}
              keyboardType={"number-pad"}
              value={seat}/>
            </View>
            <TouchableOpacity style={{flex: 3, backgroundColor: "#7a0404", height: 50, borderTopRightRadius: 25, marginVertical:10, borderBottomRightRadius: 25, justifyContent: "center", alignContent: "center" }}
            onPress={assignSeat}>
              <Text style={{fontSize: 14, color: "#fff", textAlign: "center"}}>Assign</Text>
            </TouchableOpacity>
          
        </View>}
        
     
      </View>

      <StatusBar style="auto"/>
       </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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