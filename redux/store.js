import redux from 'redux'
import { createStore, applyMiddleware, combineReducers } from 'redux';
import rootReducer from './reducer';
import * as actions from './actions';


const thunkMiddleware = require('redux-thunk').default


//const applyMiddleware = redux.applyMiddleware
//const thunkMiddleware = require('redux-thunk').default
//const combineReducers = redux.combineReducers

//const rootReducer = combineReducers({
    //auth: reducer_auth,

//})

//export default store = createStore(reducer_auth, applyMiddleware(thunkMiddleware));
//store.subscribe(()=>{ console.log(store.getState())});


//export default store;




const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

//console.log("Initial State: " + store.getState());
const unsubscribe = store.subscribe(()=>{});
//const unsubscribe = store.subscribe(()=>{ console.log("Store Item")});



unsubscribe()

export default store;