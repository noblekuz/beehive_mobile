import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, ActivityIndicator, TextInput, View, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';



var Parse = require('parse/react-native')
Parse.setAsyncStorage(AsyncStorage);


Parse.initialize("mM14bNHZPl0CiOjwJlYTQh27b2Juz3vrvWVqKIY4", "kzmSQrTwI2YbKGXduWYImH5w8VeYdN4xGUauyhjc");
Parse.serverURL = 'https://parseapi.back4app.com';

export default function PassReset(props) {
  

  let [enteredEmail,setenteredEmail] = useState("");
  const emailHandler = (pass)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setenteredEmail(pass);
      };

const reset = async()=>{
       
        if (enteredEmail === ""){
            Alert.alert("Missing Entry","Please enter your email")
        }else if(enteredEmail !== ""){
          setIsLoading(true)
              var userData = Parse.User.requestPasswordReset(enteredEmail).then(function(user) {
                
                Alert.alert("Success", "Password reset link has been sent to your email")
                enteredEmail("")

              }, function(error){
                setIsLoading(false)
              
                Alert.alert("Error", "Email you entered is invalid.")
             
              })
  
        } 
     };

  let [isLoading, setIsLoading] = useState(false)

  return (
    <View style={{width:"100%", height:"100%"}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={styles.container}>
      <View style={{width:"100%", height:"100%", alignContent: "center", alignItems:"center", padding: 10, backgroundColor:"#158bad"}}>
      <View style={{flex: 2, justifyContent:"center", alignItems:"center", marginTop:30}}>
        <Text style={{fontSize:26, color:'#fff', marginVertical:20 }}>BeeHive v2.0</Text>
        {isLoading === true ? <View><ActivityIndicator size="large" color="#0a4a5c" />
        <Text style={{fontSize:10, color:'#0a4a5c', marginVertical:10 }}>Connecting..</Text></View> : <View></View>}
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{flex:4, marginHorizontal: 20, width:"100%", backgroundColor:"#158bad", borderRadius:20, flexDirection:"column", justifyContent:"center", alignContent: "center", paddingVertical:20, paddingHorizontal:5}}>
 
        <View style={{height:"100%", alignSelf:'center', width:"100%", marginBottom:30}}>
          <View style={{alignSelf:'center'}}>
              <Text style={{color:'#adadad', fontSize:28, textAlign:'center'}}>Password Recovery</Text>
          </View>
            <View style={{backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Enter your email address.."}
              onChangeText={emailHandler}
              keyboardType={"email-address"}
              value={enteredEmail}/>
            </View>

        </View>
       
        </KeyboardAvoidingView>
        <View style={{flex:3, alignSelf:'center', width:"100%", justifyContent:'center', marginTop:40}}>
        <TouchableOpacity style={{backgroundColor:'#0e566b', width: "90%", borderRadius:25, height: 50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:2}}
          onPress={reset}
        >
          <Text style={{color:"#fff", fontSize: 18, textAlign:"center"}}>Request Reset Link</Text>
        </TouchableOpacity>
       
        <View style={{height:1, width:"100%", backgroundColor:"#0e566b", marginTop:10}}></View>
        <TouchableOpacity style={{backgroundColor:'#0e566b', width: "90%", borderRadius:25, height: 50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginTop:10}}
          onPress={()=>props.onChangeScreen("Login")}
        >
          <Text style={{color:"#08cfc7", fontSize: 18, textAlign:"center"}}>Login</Text>
        </TouchableOpacity>

        <Text style={{color: '#003b40', marginVertical: 20, textAlign:"center", fontSize:10}}>Protected by Copyright for Basket Lab. All rights reserved</Text>
        <StatusBar style="auto" />

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
