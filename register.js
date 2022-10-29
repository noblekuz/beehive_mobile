import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { ActivityIndicator, Switch, StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, AsyncStorage, Alert } from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import * as actions from './redux/actions';
import { Icon } from 'react-native-elements'

var Parse = require('parse/react-native')

Parse.initialize("mM14bNHZPl0CiOjwJlYTQh27b2Juz3vrvWVqKIY4", "kzmSQrTwI2YbKGXduWYImH5w8VeYdN4xGUauyhjc");
Parse.serverURL = 'https://parseapi.back4app.com';

export default function Register(props) {

  const reduxStore = useSelector(state => state)
  const dispatch = useDispatch();

 

  let [isLoading, setIsLoading] = useState(false);


  
  let [officer, setOfficer] = useState(reduxStore.userDetails.state.state.user)

  let [inst, setInst] = useState(reduxStore.instDetails.state.institution);


const getCovidTeamMemberDetails =async()=>{

  const User = Parse.Object.extend("User");
  const user = new Parse.Query(User);
  user.equalTo("objectId", officer.id);
      
  await user.first().then(
      function(object) {
        // the object was found
        setOfficer(object);
        props.onPassUser(object)
        
        
      },
      function(error) {
        console.log(error)
      });
}


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

useEffect(()=>{

}, [])


 
  let [userID, setUserID] = useState("")
  const userIDInputHandler = (id) =>{
    setUserID(id)
  }
  let [name, setName] = useState("")
  const nameInputHandler = (name) =>{
    setName(name)
  }
  let [phone, setPhone] = useState("")
  const phoneInputHandler = (input) =>{
    setPhone(input)
  }
  let [address, setAddress] = useState("")
  const addressInputHandler = (input) =>{
    setAddress(input)
  }

  function uniqueID() {

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
    let trimed = acronym.substring(0,3);
    return(trimed+num)
  }

  function uidPrefix(){
    let str = !inst ? "Unknown" : inst.get("Name")
      let matches = str.match(/\b(\w)/g);
      var acronym = matches.join(''); 
      let trimed = acronym.substring(0,3);
  
      return trimed
  }
    
  let [registeredPerson, setRegisteredPerson] = useState(null)

  const updateAcc= async() =>{
    if(userID===""){
      Alert.alert("Missing Entry", "Please enter User ID")
    }else if(name===""){
      Alert.alert("Missing Entry", "Please enter name")
    }else if(address===""){
      Alert.alert("Missing Entry", "Please enter Address")
    }else if(name !== "" && address !== ""){
      setIsLoading(true)
    
        const AtendantsData = Parse.Object.extend("AtendantsData");
        const attendantsData = new AtendantsData();

        const attendantsID = new Parse.Query(attendantsData);
        attendantsID.equalTo("userId", uidPrefix()+userID);
        attendantsID.first().then(function(foundItem){
          //done
          if (!foundItem){
            setIsLoading(false)
            Alert.alert("Person not found", "The entered user ID cannot be found. Check details and try again or Register as New Person")
          }else if (foundItem){

            foundItem.set("fullName", name);
            foundItem.set("address", address);
            foundItem.set("phone", phone === ""? "n/a": phone);
            foundItem.set("registeredBy", officer);

            foundItem.save().then((updated) => {
              setIsLoading(false)  
              props.onSendData(updated)   
              Alert.alert("Success",'Update successful')
              setRegisteredPerson(updated)   
              setName("")
              setAddress("")
              setPhone("")
              setUserID("")
    
                              
            }, (error) => {
              setIsLoading(false)
              alert('Failed to update user details due to: ' + error.message);
              });
         
          }
          
        }, function(err){
          console.log(err)
        })

   
    }
   
  }


  const register= async() =>{
    if(name===""){
      Alert.alert("Missing Entry", "Please enter name")
    }else if(address===""){
      Alert.alert("Missing Entry", "Please enter Address")
    }else if(name !== "" && address !== ""){
      setIsLoading(true)
    
        const AtendantsData = Parse.Object.extend("AtendantsData");
        const attendantsData = new AtendantsData();



        attendantsData.set("fullName", name);
        attendantsData.set("phoneCode", "233");
        attendantsData.set("address", address);
        attendantsData.set("phone", phone === ""? "n/a": phone);
        attendantsData.set("userId", uniqueID());
        attendantsData.set("inst", inst);
        attendantsData.set("registeredBy", officer);
        

                      
        attendantsData.save().then((registered) => {
          setIsLoading(false)  
          props.onSendData(registered)   
          Alert.alert("Success",'Registration successful')
          setRegisteredPerson(registered)   
          setName("")
          setAddress("")
          setPhone("")

                          
        }, (error) => {
          setIsLoading(false)
          alert('Failed to register user because: ' + error.message);
          });
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

  let [isUpdate, setIsUpdate] = useState(false)
  const toggleUpdateSwitch = () => setIsUpdate(previousState => !previousState);

  return (
    <View style={{flex:1, width:"100%"}}>
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={styles.container}> 
       <View style={{width:"100%", flex:1, backgroundColor:"#fff", justifyContent:"center", alignContent: "center"}}>
        
      

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "margin"} style={{flex:2, alignSelf:'center', marginTop:50, marginBottom:10, paddingHorizontal: 20}}>
        <View style={{height:"100%"}}>
            <Text style={{color:'#454545', fontSize:20, textAlign:'center', marginBottom:10}}>{!inst ? "Unknown" : inst.get("Name")}</Text>
            <Text style={{color:'#adadad', fontSize:16, textAlign:'center'}}>Register New Person</Text>
        </View>
        </KeyboardAvoidingView>
        

        {isLoading === true ? <View style={{flex:1}}><ActivityIndicator size="small" color="#0a4a5c" /></View> : <View style={{flex:0}}></View>}

        {!registeredPerson ? <View style={{flex:0}}></View>: 
        <View style={{backgroundColor:"#fff", width:"90%", marginBottom:10, alignSelf:"center", alignContent:"center", alignItems: "center", flex: 4, borderRadius: 15,  borderWidth:1, borderColor:"#d1d1d1", padding:10, borderStyle:"dashed", marginHorizontal: 20 }}>
          <View style={{backgroundColor:!registeredPerson ? "#ffeded" : "#fff9e3", width:"100%", height: "100%", borderRadius: 15, padding:5  }}>
            
            <View style={{width:"100%"}}>
              <Text style={{fontSize:14, marginVertical: 10, alignSelf: "center", textAlign:"center"}}>Registration Successful: {registeredPerson.get("fullName")} has been assigned ID no:</Text>
              <View style={{flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
              <Text style={{fontSize:24, alignSelf: "center", textAlign:"center"}}>{registeredPerson.get("userId").substring(3)}</Text>
              <TouchableOpacity onPress={()=>setRegisteredPerson(null)} style={{backgroundColor:"red", width:30, height:30, borderRadius: 15, marginLeft:20, justifyContent:"center"}}>
              <Icon name='close' type='material-community' color='#fff'/>
              </TouchableOpacity>
              </View>
              
            </View> 
          </View>

        </View>}
        
      
            <View style={{flex:12, width:"100%"}}>
            <ScrollView style={{height:"100%", alignSelf:'center', width:"100%", marginBottom: 5, marginTop: 10, paddingHorizontal: 20}}> 
            <View style={{paddingHorizontal:20, marginVertical:10, flexDirection: "row", justifyContent:"center", alignContent:"center", alignItems:"center"}}>
              <Text style={{marginRight:20, fontSize:14,}}>Update Existing Attendant? </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#93ddfa" }}
                thumbColor={isUpdate ? "#027dad" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleUpdateSwitch}
                value={isUpdate}
            />
            </View>

            {isUpdate === true ? <View style={{backgroundColor:'#ebebeb', borderRadius: 25, height:50, justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"User ID"}
              onChangeText={userIDInputHandler}
              keyboardType="number-pad"
              value={userID}/>
            </View> : <View></View>} 
            
            <View style={{backgroundColor:'#ebebeb', borderRadius: 25, height:50, justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Full Name"}
              onChangeText={nameInputHandler}
              value={name}/>
            </View>
            <View style={{backgroundColor:'#ebebeb', borderRadius: 25, height:50, justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Phone Number"}
              onChangeText={phoneInputHandler}
              keyboardType="number-pad"
              value={phone}/>
            </View>
            <View style={{backgroundColor:'#ebebeb', borderRadius: 25, height:50, justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Home Address"}
              onChangeText={addressInputHandler}
              value={address}/>
            </View>

            <View style={{alignSelf:'center', width:"100%", marginVertical: 15, flexDirection: "row", flex: 10}}>
            <TouchableOpacity style={{backgroundColor:isUpdate===true ? "#027dad" : "#187002", height: 50, width:"100%", borderRadius: 25, marginTop:20, justifyContent: "center", alignContent: "center" }}
            onPress={isUpdate===true? updateAcc : register}>
              <Text style={{fontSize: 14, color: "#fff", textAlign: "center"}}>{isUpdate === true ?"Update":"Register"}</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
          </View>
      
              
      </View>

    </TouchableWithoutFeedback>  
    <StatusBar style="auto" />
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