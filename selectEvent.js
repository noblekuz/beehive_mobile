
import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, TouchableWithoutFeedback, ActivityIndicator, FlatList, ToastAndroid, Modal, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import * as actions from './redux/actions';


var Parse = require('parse/react-native')

Parse.initialize("mM14bNHZPl0CiOjwJlYTQh27b2Juz3vrvWVqKIY4", "kzmSQrTwI2YbKGXduWYImH5w8VeYdN4xGUauyhjc");
Parse.serverURL = 'https://parseapi.back4app.com';



export default function SelectEvent(props) {
  const reduxStore = useSelector(state => state)
  const dispatch = useDispatch();

  let [officer, setOfficer] = useState(!reduxStore.userDetails.state.state.user?reduxStore.userDetails.state.state.state.user : reduxStore.userDetails.state.state.user)

  useEffect(()=>{

  }, [])



let [inst, setInst] = useState(!reduxStore.instDetails.state.institution? reduxStore.instDetails.state.state.institution : reduxStore.instDetails.state.institution );
let [selectedEvent, setSelectedEvent] = useState(null);
let [isExpired, setIsExpired] = useState(inst.get("nextExpiry") < new Date ())


const getInstDetails =async()=>{
 
    const inst = Parse.Object.extend("institution");
    const instQuery = new Parse.Query(inst);
    instQuery.equalTo("objectId", officer.get("inst").id);
        
    await instQuery.first().then(
        function(object) {
    

          setInst(object)
          
        },
        function(error) {
          console.log(error)
        });

}

let [myEvents, setMyEvents] = useState(reduxStore.eventsDetails.events);  


const refreshEvents = () =>{
  const Events = Parse.Object.extend("events");
  const events = new Parse.Query(Events);
  events.equalTo("institution", inst);
  let res = events.find().then(
    function(object) {
                        
      setMyEvents(object)
      setIsLoading(false)

         
    },
      function(error) {

      setIsLoading(false)
     
    })
}




useEffect(()=>{
  getInstDetails();
  refreshEvents();
}, [])



const loadEvent = ()=>{
  if(!selectedEvent){
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravityAndOffset("Please select an Event", ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
      } else {
        Alert.alert("No choice","Please select an Event");
      }
  }else if(selectedEvent){

    const STORAGE_KEY = "@eventDetails";
                  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                    eventName:selectedEvent.get('eventName'),
                    event_id:selectedEvent.get('eventID'),
                  }), (err)=>{
                    console.log(err)
                  })
    
  
   props.onHoldEvent(selectedEvent)
   props.onChangeScreen("Main") 
   

  }
}


function generateEventID() {

  function generate(n) {
    var add = 1, max = 12 - add;

    if ( n > max ) {
            return generate(max) + generate(n - max);
    }

    max        = Math.pow(10, n+add);
    var min    = max/10; 
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;

    return ("" + number).substring(add); 
  }

  let num = generate(6)
  let str = !inst ? "Unknown" : inst.get("Name")
  let matches = str.match(/\b(\w)/g);
  var acronym = matches.join(''); 
  let trimed = acronym.substring(0,3).toUpperCase();
  return(trimed+num+"_ev")
}

let [createEventModal, setCreateEventModal] = useState(false)
const createNewEvent = ()=>{
  if(eventName ===""){
    Alert.alert("Missing Entry", "Event Name is required")
  }else if(eventName !==""){
    setIsLoading(true)
    const events = Parse.Object.extend("events");
    const Events = new events();

    Events.set("institution", inst);
    Events.set("eventID", generateEventID());
    Events.set("eventName", eventName);
    Events.set("createdBy", officer);
    Events.set("eventStatus", 1);
    Events.set("eventDate" || eventDate ? new Date():  new Date(eventDate));
    
    Events.save().then((created) => {

        setIsLoading(false);
        setEventDate("");
        setEventName("");
        setCreateEventModal(false);
        refreshEvents()
        Alert.alert("Success",'New event added to your List');


    }, (error) => {
      setIsLoading(false)
      alert('Failed to assign seat, because: ' + error.message);
    });

  }
}

let [eventName, setEventName] = useState("")
const eventNameInput = (input) =>{
  setEventName(input)
}

let [eventDate, setEventDate] = useState("")
const eventDateInput = (date) =>{
  setEventDate(date)
}

let [delModal, setDelModal] = useState(false)
let [itemDel, setItemDel] = useState(null)

const deleteModal = (item) =>{
  if(props.usher && props.usher.get("acc_type")===2){
    setItemDel(item)
    setDelModal(true)
  }else{
  }
}



const delEvent = () =>{
  
  const events = Parse.Object.extend("events");
  const QEvent = new Parse.Query("events");
  QEvent.get(itemDel.id).then((obj) => {
      obj.destroy({})
      refreshEvents();
      setDelModal(false)
    }, (error) => {
      // The delete failed.
      console.log(error)
    });
    
}

const dismisCreateModal = () =>{
  setEventName("")
  setCreateEventModal(false)
}


let [isLoading, setIsLoading] = useState(false)
  return (
    <View style={styles.container}>

       

       <View style={{flex:14, width:"100%", backgroundColor:"#fff", borderRadius:20, flexDirection:"column", alignContent: "center", paddingTop:20, paddingBottom:40, paddingHorizontal:10}}>
        <View style={{flex:1, alignSelf:'center', marginBottom:30}}>
            <Text style={{color:'#454545', fontSize:16, textAlign:'center'}}>{!inst ? "Unknown Institution" : inst.get("Name")}, {!inst ? "Unknown Community" : inst.get("city")}</Text>
            <Text style={{color:'#adadad', fontSize:14, textAlign:'center', marginTop: 10}}>Please Choose an Event</Text>
        </View>

        {isLoading === true ? <View><ActivityIndicator size="small" color="#0a4a5c" /></View> : <View></View>}
        

        {officer.get("acc_type") === 2 && isExpired !== true? 
        <TouchableOpacity onPress={()=>setCreateEventModal(true)} style={{height:50, width:"100%", backgroundColor:"#04752b", borderRadius: 25, justifyContent:"center", alignItems:"center", marginBottom:20}}>
          <Text style={{color:'#fff', fontSize:14, textAlign:'center'}}>Create New Event</Text>
        </TouchableOpacity>: <View></View>}

        {isExpired === true && officer.get("acc_type") === 2 && props.expiry ? 
        <View style={{backgroundColor:"#fff", width:"90%", marginBottom:10, alignSelf:"center", alignContent:"center", alignItems: "center", flex: 1, borderRadius: 10, justifyContent:"center",  borderWidth:1, borderColor:"#d1d1d1", padding:2, borderStyle:"dashed", marginHorizontal: 10 }}>
          <View style={{backgroundColor:"#cf0000", width:"100%", height: "100%", borderRadius: 10, padding:3, justifyContent:"center" }}>
            <View style={{width:"100%", justifyContent:"center"}}>
              <Text style={{fontSize:12, marginVertical: 2, alignSelf: "center", textAlign:"center", color:"#fff"}}>Sorry! Your Institutions usage plan is expired. Visit beehive.orbitag.net and extend your usage plan</Text>
            </View> 
          </View>

        </View>:<View style={{flex:0}}></View>}

        {/*Modal for New Event*/}
        <Modal visible={createEventModal} style={{height: '100%', width:'100%' }} animationType='slide' transparent={true}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{width:"100%", height:"100%"}}>
                        <View style={{backgroundColor: 'rgba(52, 52, 52, 0.8)', width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
                        
  
                            <View style={{width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignSelf: 'center'}}>
                                <Text style={{fontSize: 20, color: '#292929'}}>Create New Event</Text>
                                <Text style={{fontSize: 12, color: '#292929'}}>{!inst ? "Unknown" : inst.get("Name")} </Text>

                            {/* koliko */}

                              
                                <View style={{width: '100%', marginBottom: 10}}>                         
                                    <Text style={{fontSize: 12, color:'#6b6b6b', marginTop:10}}>Fill in event details</Text>                        
                                </View>

                               
                                      <View style={{backgroundColor:'#cccccc', width: "100%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginTop:10}}>
                                        <TextInput 
                                        style={{fontSize:16}}
                                        placeholder={"Event Name"}
                                        onChangeText={eventNameInput}
                                        value={eventName}/>
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


                                            }} onPress={()=>dismisCreateModal()}><Text style={
                                                {color:"black",
                                                fontSize: 18,
                                                alignSelf: 'center'}}>Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity  onPress={createNewEvent} style={{
                                                width: 120,
                                                height: 40,
                                                backgroundColor: "#04752b",
                                                borderRadius: 20,
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 10,


                                            }}><Text style={{color:'#ffffff', fontSize: 18, alignSelf: 'center'}}>Save Event</Text>
                                            </TouchableOpacity>
                                            
                                    </View>
                                    

                            </View>
                        </View>
                        </TouchableWithoutFeedback>
                    </Modal>
        {/*Modal for Deleting Event*/}
        <Modal visible={delModal} style={{height: '100%', width:'100%' }} animationType='slide' transparent={true}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{width:"100%", height:"100%"}}>
                        <View style={{backgroundColor: 'rgba(52, 52, 52, 0.8)', width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
                        
  
                            <View style={{width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignSelf: 'center'}}>
                                <Text style={{fontSize: 20, color: '#292929'}}>Delete {!itemDel ?"Unknown" : itemDel.get("eventName")}</Text>
                             

                            {/* koliko */}

                              
                                <View style={{width: '100%', marginBottom: 10}}>                         
                                    <Text style={{fontSize: 12, color:'red', marginTop:10}}>Make sure this event's seat log has been downloaded</Text>                        
                                    <Text style={{fontSize: 16, color:'#6b6b6b', marginTop:10}}>Do you really want to delete this event?</Text>                        
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


                                            }} onPress={()=>setDelModal(false)}><Text style={
                                                {color:"black",
                                                fontSize: 18,
                                                alignSelf: 'center'}}>Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity  onPress={delEvent} style={{
                                                width: 120,
                                                height: 40,
                                                backgroundColor: "#8c0002",
                                                borderRadius: 20,
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 10,


                                            }}><Text style={{color:'#ffffff', fontSize: 18, alignSelf: 'center'}}>Delete</Text>
                                            </TouchableOpacity>
                                            
                                    </View>
                                    

                            </View>
                        </View>
                        </TouchableWithoutFeedback>
                    </Modal>
        
       
        <View style={{backgroundColor:"#fff", width:"100%", flex: 8, borderRadius: 15, marginTop: 10, borderWidth:1, borderColor:"#d1d1d1", padding:10, borderStyle:"dashed"  }}>
          
            {!myEvents || myEvents.length ===0 ? <View><Text style={{textAlign: "center", fontSize: 14}}>No Event has been setup by your Admin</Text></View>:
            <View style={{alignContent:"center", alignItems: "center"}}>      
                <FlatList
                  style={{height: '100%', width: '100%', marginHorizontal: 10, }}
                  data = {myEvents}
                  key={() => {new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString()}}
                  renderItem={({item}) => (
                    <TouchableOpacity onPress={() =>setSelectedEvent(item)} onLongPress={()=>deleteModal(item)}>
                      <View style={{backgroundColor:item === selectedEvent? "#fff4db":"#fff", width:'100%', height: 70, flexDirection: 'row', borderBottomColor: '#cfcfcf', borderBottomWidth:1, paddingVertical: 10, alignContent:"center", alignItems:"center"}}>               
                        <View style={{justifyContent: 'center', flex: 7, marginHorizontal: 15}}>
                          <Text>{item.get("eventName")}</Text>
                          <Text style={{fontSize:10, color:"#6b6b6b"}}>Event ID: {item.get("eventID")}</Text>
                         </View>
                                 
                      <View style={{justifyContent: 'center', flex: 3}}>
                          <Text style={{color:item.get("eventStatus") ===1 ? "#028500" : "#696969", fontSize:12}} >{item.get("eventStatus") ===1 ? "Open" : "Closed"}</Text>
                       </View>
                                
                    </View>
                 </TouchableOpacity>
                 )}
              /> 

            </View> }
                         

        </View>

        {!selectedEvent ? <View></View> : <View style={{flex:1, alignSelf:'center', width:"100%", marginVertical: 20, flexDirection: "row"}}>
            <TouchableOpacity style={{flex: 3, backgroundColor: "#7a0404", height: 50, borderRadius: 25, marginVertical:10, justifyContent: "center", alignContent: "center" }}
            onPress={loadEvent}>
              <Text style={{fontSize: 14, color: "#fff", textAlign: "center"}}>Usher-in Attendants</Text>
            </TouchableOpacity>
        </View>}


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