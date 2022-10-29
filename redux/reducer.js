import * as actions from './actions';
import * as aT from './actionTypes'
import { AsyncStorage } from 'react-native';
import produce from "immer"
import { createStore, applyMiddleware, combineReducers } from 'redux';


//const redux = require('redux');
//const applyMiddleware = redux.applyMiddleware
//const thunkMiddleware = require('redux-thunk').default


const initialState = { 
    user:null,
    institution:null,
    events:null,
    selectedEvent:null,    
}


 const instReducer = ( state=initialState, action) => {

    switch(action.type){     
        case aT.UPDATE_INST: return{
            ...state, institution: action.payload.inst
        }

            /* return produce (state, draft =>{ 
                //draft.institution = action.payload.inst
                draft.push(institution= action.payload.inst)
            }) */

           
        case aT.LOGOUT_USER:
            return state 

        default: return {
            state
        } 
        

    }

}
 const userReducer = ( state=initialState, action) => {

    switch(action.type){
        case aT.UPDATE_USER:return{
            ...state, user: action.payload.user
        }

            /* return produce(state, draft =>{
                //draft.user = action.payload.user;
                draft.push(user= action.payload.user)
            }); */
            
        case aT.LOGOUT_USER: return{
            state 
            }

        default: return {
            state
        } 
        

    }

}
 const eventReducer = ( state=initialState, action) => {

    switch(action.type){           
        case aT.UPDATE_EVENTS: return{
            ...state, events: action.payload.eventsArray
        }
            /* return produce(state, draft =>{
                //draft.events = action.payload.eventsArray
                draft.push(events= action.payload.eventsArray)
    
            }) */
            
        case aT.LOGOUT_USER:
            return state 

        default: return {
            state
        } 
        

    }


}
 const selectedEventReducer = ( state=initialState, action) => {

    switch(action.type){           
        case aT.SET_SELECTED_EVENT:return{
            ...state, selectedEvent: action.payload.evObj
        }
           /*  return produce(state, draft =>{
               // draft.selectedEvent = action.payload.evObj
                draft.push(selectedEvent= action.payload.evObj)
    
            }) */
            
        case aT.LOGOUT_USER:
            return state

        default: return {
            state
        } 
        

    }

}

const rootReducer = combineReducers({
    userDetails: userReducer,
    instDetails: instReducer,
    eventsDetails: eventReducer,
    selectedEventsDetails: selectedEventReducer,
}) 

export default rootReducer;