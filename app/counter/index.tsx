import { useRouter } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../theme";
import { requestPermissionsAsync } from "expo-notifications";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";



export default function CounterScreen() {
  const [ secondsElapsed , setSecondsElapsed ] = useState(0);

  useEffect(()=>{
   const intervalId = setInterval(()=>{
      setSecondsElapsed( (val) => val + 1);
    } , 1000)
    return  () => {
      clearInterval(intervalId);
    }
  } , [])

  const scheduleNotification = async() => {
    const result = await requestPermissionsAsync();
    if(result.status === "granted"){
      console.log(result);
      await Notifications.scheduleNotificationAsync({
        content : {
          title : "I am a notification from your app 😁😀😀",
        },
        trigger : {
          type : Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds : 5,
        },
      })
    } else {
      if(Device.isDevice){
        Alert.alert("Unable to schedule notification..." , "Enable the notification permission for Expo Go in settings . ");
      }
      
    }
  }

  return (
    <View style={styles.container}>
      <Text>
      {secondsElapsed}
      </Text>
      <TouchableOpacity style = {styles.button} onPress={scheduleNotification}>
        <Text style={styles.text}>Schedule notifications </Text>
      </TouchableOpacity>
      <Text style={styles.text}>Counter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    color: theme.colorWhite,
    fontWeight: 200,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 10,
    borderRadius: 5,
  }
});
