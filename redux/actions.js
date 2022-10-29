import * as aT from './actionTypes';



export function updUser(user){
    return{
        type: aT.UPDATE_USER,
        payload: {
            user, 
        }
    }
}

export function updInst(inst){
    return{
        type: aT.UPDATE_INST,
        payload: {
            inst,
        }
    }
}
export function updEvent(eventsArray){
    return{
        type: aT.UPDATE_EVENTS,
        payload: {
            eventsArray,
        }
    }
}
export function updSelectedEvent(evObj){
    return{
        type: aT.SET_SELECTED_EVENT,
        payload: {
            evObj,
        }
    }
}


export function logout(){
    return{
        type: aT.LOGOUT_USER,
    }
}