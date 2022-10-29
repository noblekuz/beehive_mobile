import { StatusBar } from 'expo-status-bar';
import React, {useState, useRef, useEffect} from 'react';
import {  StyleSheet, Text, ActivityIndicator, TextInput, View, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import {useSelector, useDispatch} from 'react-redux';
import * as actions from './redux/actions';


var Parse = require('parse/react-native')
Parse.setAsyncStorage(AsyncStorage);





Parse.initialize("APP_KEY", "API_KEY");
Parse.serverURL = 'https://parseapi.back4app.com';

export default function Login(props) {
  const reduxStore = useSelector(state => state)
  const dispatch = useDispatch();



  let [enteredPass,setenteredPass] = useState ("");
  const passInputHandler = (pass)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setenteredPass(pass);
      };
  
  let [enteredEmail,setenteredEmail] = useState("");
  const emailHandler = (pass)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setenteredEmail(pass.toLowerCase());
      };

const sign_in = async()=>{


        if (enteredEmail === ""){

            //errorSignal ID
            Alert.alert("Missing Entry","Please enter your email")
        }else if (enteredPass === ""){
            Alert.alert("Missing Entry","Please enter your password")
        }else if(enteredEmail !== "" && enteredPass !== ""){
          setIsLoading(true)
              var userData = Parse.User.logIn(enteredEmail, enteredPass).then(function(user) {
               
                 dispatch(actions.updUser(user));
                  props.onPassUser(user)                 
                  const STORAGE_KEY = "@userDetails";
                  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
                    name:user.get('username'),
                    id:user.get('personalID'),
                    objID:user.get("objectId"),
                    email:user.get('email'),
                    instID:user.get('inst'),
                    acc_type:user.get('acc_type')
                  }), (err)=>{
                    console.log(err)
                  })
                
                  
                  //checkExpiry
                  const Institution = Parse.Object.extend("institution");
                  const institution = new Parse.Query(Institution);
                  institution.equalTo("objectId", user.get("inst").id);
                  institution.first().then(
                    function(object) {
                        
                        dispatch(actions.updInst(object));
                        props.onSetExpiry(object.get("nextExpiry"))

                        //Fetch Inst Events
                        const Events = Parse.Object.extend("events");
                        const events = new Parse.Query(Events);
                        events.equalTo("institution", user.get('inst'));
                        if(object.get("nextExpiry") < new Date()){events.limit(1)} 
                        events.find().then(
                          function(ev) {
                            dispatch(actions.updEvent(ev));
                            props.onPassValue(ev)
                            setIsLoading(false)
                            props.onChangeScreen("SelectEvent") 
                            //return objects
                        
                          },
                          function(error) {
                            setIsLoading(false)
                            console.log(error)
                          })
                      

                    },function(err){
                      alert(error)
                    })


                  
                  
                  

              }, function(error){
                Alert.alert("Failed", "Wrong Email or Password")
                setIsLoading(false)
                console.log(error)
             
              })
  
        } 
     };

  let [isLoading, setIsLoading] = useState(false)

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
    

  return (
    <View style={{width:"100%", height:"100%"}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={styles.container}>
      <View style={{width:"100%", height:"100%", alignContent: "center", alignItems:"center", padding: 10, backgroundColor:"#158bad"}}>
      <View style={{flex: 2, justifyContent:"center", alignItems:"center", marginVertical:10}}>
        {isOpen===true && Platform.OS==="android"?<Text></Text>: <Text style={{fontSize:26, color:'#fff' }}>BeeHive v2.0</Text> }
        {isLoading === true ? <View><ActivityIndicator size="small" color="#0a4a5c" />
        <Text style={{fontSize:10, color:'#0a4a5c', marginVertical:10 }}>Fetching data..</Text></View> : <View></View>}
      </View>
    
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{flex:4, marginHorizontal: 20, width:"100%", backgroundColor:"#158bad", borderRadius:20, flexDirection:"column", justifyContent:"center", alignContent: "center", paddingHorizontal:5}}>
 
        <View style={{alignSelf:'center', width:"100%", paddingBottom:30, backgroundColor:"#158bad"}}>
          <View style={{alignSelf:'center'}}>
              <Text style={{color:'#adadad', fontSize:28, textAlign:'center', marginTop:20}}>Sign in</Text>
          </View>
            <View style={{backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Enter your email"}
              onChangeText={emailHandler}
              keyboardType={"email-address"}
              value={enteredEmail}/>
            </View>
            <View style={{backgroundColor:'#cccccc', marginBottom:20, width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginTop:10, marginBottom:40}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Password"}
              secureTextEntry={true}
              onChangeText={passInputHandler}
              value={enteredPass}/>
            </View>
        </View>

        </KeyboardAvoidingView>
    


        <View style={{flex:4, alignSelf:'center', width:"100%", justifyContent:'center', marginTop:30,}}>
        <TouchableOpacity style={{backgroundColor:'#0e566b', marginTop:20, width: "90%", borderRadius:25, height: 50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:2}}
          onPress={sign_in}
        >
          <Text style={{color:"#fff", fontSize: 18, textAlign:"center"}}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{width: "90%", borderRadius:25, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 10, marginVertical:10}}
          onPress={()=>props.onChangeScreen("ForgottenPass")}
        >
          <Text style={{color:"#084d69", fontSize: 14, textAlign:"center"}}>Forgotten Password? Reset</Text>
        </TouchableOpacity>
        <View style={{height:1, width:"100%", backgroundColor:"#0e566b", marginTop:10}}></View>
        <TouchableOpacity style={{backgroundColor:'#0e566b', width: "90%", borderRadius:25, height: 50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginTop:10}}
          onPress={()=>props.onChangeScreen("Signup")}
        >
          <Text style={{color:"#08cfc7", fontSize: 18, textAlign:"center"}}>I need account as Usher</Text>
        </TouchableOpacity>

        
        <StatusBar style="auto" />
        <Text style={{color: '#003b40', marginVertical: 10, textAlign:"center", fontSize:10}}>Protected by Copyright for Basket Lab. All rights reserved</Text>

        </View>
        
        


     
      </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 20,
    backgroundColor: '#2f8a94',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
