import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';




export default function Splash() {



  return (
    <View style={styles.container}>
      <Image
        style={{width:70, height:70}}
        source={require('./assets/splash.png')}
      />
      <Text style={{color:"#303030", fontSize:48}}>BeeHive</Text>
      <Text style={{color:"#1f1f1f", fontSize:14}}>Version 4.0</Text>
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
});