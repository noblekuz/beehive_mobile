import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator, TextInput, View, TouchableOpacity, Platform, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';




var Parse = require('parse/react-native')
Parse.setAsyncStorage(AsyncStorage);


Parse.initialize("APP_KEY", "API_KEY");
Parse.serverURL = 'https://parseapi.back4app.com';

export default function Signup(props) {
  

  let [enteredFirstName,setEnteredFirstName] = useState ("");
  const firstNameInputHandler = (name)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setEnteredFirstName(name);
      };
  let [enteredLastName,setEnteredLastName] = useState ("");
  const lastNameInputHandler = (name)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setEnteredLastName(name);
      };
  let [enteredPass,setEnteredPass] = useState ("");
  const passInputHandler = (pass)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setEnteredPass(pass);
      };
  
  let [enteredEmail,setEnteredEmail] = useState("");
  const emailInputHandler = (em)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setEnteredEmail(em);
      };
  let [enteredInstID, setEnteredInstID] = useState("");
  const instIDInputHandler = (em)=>{
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      setEnteredInstID(em);
      };

  function uniqueID(inst) {

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






const signup = async()=>{

  
        if (enteredFirstName === ""){
            Alert.alert("Missing Entry","Please enter your firstName")
        }else if (enteredLastName === ""){
            Alert.alert("Missing Entry","Please enter your Surname")
        }else if (enteredEmail === ""){
            Alert.alert("Missing Entry","Please enter your Email")
        }else if (enteredInstID === ""){
            Alert.alert("Missing Entry","Please enter your institution's ID. Contact your Administrator")
        }else if (enteredPass === ""){
            Alert.alert("Missing Entry","Please enter your password")
        }else if(enteredEmail !== "" && enteredPass !== "" && enteredLastName !== "" && enteredInstID !=="" && enteredFirstName !==""){
          setIsLoading(true)

           const Institution = Parse.Object.extend("institution");
           const institution = new Parse.Query(Institution);
           institution.equalTo("inst_id", enteredInstID);
           institution.first().then(
             function(object) {
               if(!object){
                setIsLoading(false)
                Alert.alert("Invalid Institution ID","Institution ID is wrong. Please enter valid institution ID")
               }else if(object){
                console.log("creating Accont")
                const user = new Parse.User();
                user.set("username", enteredFirstName);
                user.set("password", enteredPass);
                user.set("email", enteredEmail);

                user.set("inst", object);
                user.set("lastName", enteredLastName);
                user.set("personalID", uniqueID(object));
                try {
                   user.signUp();
                  setIsLoading(false)
                  Alert.alert("Success","Account created for "+enteredFirstName+". Please check your email and verify")
                  setEnteredFirstName("")
                  setEnteredLastName("")
                  setEnteredEmail("")
                  setEnteredInstID("")
                  setEnteredPass("")
              
                } catch (error) {
                  setIsLoading(false)
                  Alert.alert("Error: " + error.code + " " + error.message);
                }

               }
            
              setIsLoading(false)
  
            
             },
             function(error) {
               setIsLoading(false)
               console.log(error)
             })



             
  
        } 
     };

    let [isLoading, setIsLoading] = useState(false)

  return (
    <View style={{width:"100%", height:"100%"}}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={styles.container}>
      <View style={{width:"100%", height:"100%", alignContent: "center", alignItems:"center", padding: 10, backgroundColor:"#158bad"}}>
      <View style={{flex: 1, justifyContent:"center", alignItems:"center", marginTop:20, marginBottom:10}}>
        {isOpen== true && Platform.OS==="android"?<Text></Text>:<Text style={{fontSize:20, color:'#fff',  }}>BeeHive v2.0</Text> }
        {isLoading === true ? <View><ActivityIndicator size="large" color="#0a4a5c" />
        <Text style={{fontSize:10, color:'#0a4a5c', marginVertical:10 }}>Connecting..</Text></View> : <View></View>}
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:10, marginHorizontal: 20, width:"100%", backgroundColor:"#158bad", borderRadius:20, flexDirection:"column", justifyContent:"center", alignContent: "center", paddingHorizontal:5}}>
        <View style={{flex:1, alignSelf:'center',height:"30%",}}>
            <Text style={{color:'#adadad', fontSize:22, textAlign:'center'}}>Sign up as Usher</Text>
        </View>
  
        <ScrollView style={{width:"100%", height:"70%", alignSelf:'center', marginBottom:30 }}>
            <View style={{backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Firstname"}
              onChangeText={firstNameInputHandler}
              value={enteredFirstName}/>
            </View>
            <View style={{ backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Surname"}
              onChangeText={lastNameInputHandler}
              value={enteredLastName}/>
            </View>
            <View style={{ backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Email"}
              onChangeText={emailInputHandler}
              keyboardType={"email-address"}
              value={enteredEmail}/>
            </View>
            <View style={{backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Institutions ID"}
              onChangeText={instIDInputHandler}
              value={enteredInstID}/>
            </View>
            <View style={{ backgroundColor:'#cccccc', width: "90%", borderRadius:25, height:50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:10}}>
              <TextInput 
              style={{fontSize:16}}
              placeholder={"Password"}
              secureTextEntry={true}
              onChangeText={passInputHandler}
              value={enteredPass}/>
            </View>
        
        

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{flex:2, alignSelf:'center', width:"100%", justifyContent:'center', marginTop:40, marginBottom:40}}>
        <TouchableOpacity style={{backgroundColor:'#0e566b', width: "90%", borderRadius:25, height: 50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginVertical:2}}
          onPress={signup}>
          <Text style={{color:"#fff", fontSize: 18, textAlign:"center"}}>Signup</Text>
        </TouchableOpacity>
        <View style={{height:1, width:"100%", backgroundColor:"#0e566b", marginTop:10}}></View>
        <TouchableOpacity style={{ marginBottom:10, backgroundColor:'#0e566b', width: "90%", borderRadius:25, height: 50, alignSelf:'center', justifyContent: 'center', paddingHorizontal: 20, marginTop:10}}
          onPress={()=>props.onChangeScreen("Login")}
        >
          <Text style={{color:"#08cfc7", fontSize: 18, textAlign:"center"}}>Login</Text>
        </TouchableOpacity>

        <Text style={{color: '#003b40', textAlign:"center", fontSize:10}}>Protected by Copyright for Basket Lab. All rights reserved</Text>
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
