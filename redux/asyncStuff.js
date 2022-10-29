import { AsyncStorage } from 'react-native'
import keys from '../../components/databaseFake';

const redux = require('redux');
const createStore = redux.createStore
const applyMiddleware = redux.applyMiddleware
const thunkMiddleware = require('redux-thunk').default


//::::::::::::::::::::::::::::::::::::::::::::::: DB Connnection
var Parse = require("parse/react-native");
Parse.setAsyncStorage(AsyncStorage);

AsyncStorage.clear();
Parse.initialize(keys.appkey, keys.platformKey)
Parse.serverURL = 'https://parseapi.back4app.com'

// Create a new instance of the user class
         

//:::::::::::::::::::::::::::::::::::::::::::::: Store Structure


const rawState = {
    loading: false,
    userDetails:[],
    error:[],

}

//:::::::::::::::::::::::::::::::::::::::::::::: Functions

 export const loginUser = (email, pwd) => {
    return function (dispatch){
        dispatch(fetchUserDetails());
            Parse.User
                    .logIn(email, pwd).then(function(user) {
                        //console.log('Logged-in succesfully with name: ' + user.get("username") + ' and email: ' + user.get("email"));
                       
                        const person = {
                            myId:user.get('uniqueAccNum'),
                            myEmail: user.get('email'),
                            myNickname: user.get('nickname'),
                            myFirstname: user.get('firstname'),
                            myLastname: user.get('myLastname'),
                            myCurr: user.get('currency'),
                            myCurrSymbol: user.get('currSymbol'),
                            myAccountType: user.get('accountType'),
                            }

                        dispatch(fetchSuccess(person))


                       // props.onHomeScreen('Main');

                }).catch(function(error){
                    //console.log("Error: " + error.code + " " + error.message);
                    const errorObj = {
                        code: error.code,
                        message: error.message,
                    }

                    dispatch(fetchFail(errorObj));

                });

    }
}

export const FETCH_USER = "FETCH_USER_DETAILS";
export const FETCH_SUCCESS = "FETCH_SUCCESS";
export const FETCH_FAIL = "FETCH_FAIL";
export const CLEAR_USER = "CLEAR_USER_DETAILS";

const fetchUserDetails = () => {
    return{
        type: FETCH_USER,
    
    }

}

const fetchSuccess = user =>{
    return{
        type: FETCH_SUCCESS,
        payload: user
    }
}

const fetchFail = error =>{
    return{
        type: FETCH_FAIL,
        payload: error
    }
}

const clearUser = () =>{
    return{
        type: CLEAR_USER
    }
}

const reducer = (rawState, action) => {
    
    switch(action.type){
        case FETCH_USER:
            return {
                loading: true 
            }
        case FETCH_SUCCESS:
            return {
                loading: false,
                user: action.payload,
                error: ""
            }
        case FETCH_FAIL:
            return {
                loading: false,
                user: [],
                error: action.payload
            }
        case CLEAR_USER:
            return {
                user:[]
            }
        

    }

}

export const store = createStore(reducer, applyMiddleware(thunkMiddleware));

//store.subscribe(()=>{ console.log(store.getState())});


