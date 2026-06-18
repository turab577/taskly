import { Text, View, StyleSheet, TouchableOpacity, Alert , ActivityIndicator , useWindowDimensions } from "react-native";
import { theme } from "../../theme";
import { requestPermissionsAsync } from "expo-notifications";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Duration, intervalToDuration, isBefore } from "date-fns";
import { TimeSegment } from "../../components/TimeSegment";
import { getFromStorage, saveToStorage } from "../../utils/storage";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";

const frequency = 14 * 24 * 60 * 60 * 1000;

export const countddownStorageKey = "countdown_state";

export type PersistedCountdownState = {
  currentNotificationId : string | undefined;
  completedAt : number[];
}

type CountDownStatus = {
  isOverdue: boolean;
  distance: Duration;
}
   
export default function CounterScreen() {
  const {width} = useWindowDimensions();
  const confettiRef = useRef<any>();
  const [countDownState, setCountdownState] = useState<PersistedCountdownState>()
  const [isLoading , setIsLoading] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [status, setStatus] = useState<CountDownStatus>({
    isOverdue: false,
    distance: {}
  });

  const lastCompletedTimeStamp = countDownState?.completedAt[0]

  useEffect(()=>{
    const init = async () => {
      const value = await getFromStorage(countddownStorageKey);
      setCountdownState(value);
      setIsLoading(false);
    }
    init ()
  } , [])

  // console.log(status)

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeStamp = lastCompletedTimeStamp ? lastCompletedTimeStamp + frequency : Date.now() + frequency;
      const isOverdue = isBefore(timeStamp, Date.now());
      if (lastCompletedTimeStamp) {
        setIsLoading(false);
      }
      const distance = intervalToDuration(isOverdue ? { start: timeStamp, end: Date.now() } : { start: Date.now(), end: timeStamp })
      setStatus({
        isOverdue, distance
      })
      setSecondsElapsed((val) => val + 1);
    }, 1000)
    return () => {
      clearInterval(intervalId);
    }
  }, [ lastCompletedTimeStamp ])

  const scheduleNotification = async () => {
    confettiRef?.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let pushNotificationId ;
    const result = await requestPermissionsAsync();
    if (result.status === "granted") {
      pushNotificationId = await Notifications.scheduleNotificationAsync({
        content : {
          title : "Time to wash your car again! 🧽🧼",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
        }
      })
      console.log(result);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "I am a notification from your app 😁😀😀",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      })
    } else {
      if (Device.isDevice) {
        Alert.alert("Unable to schedule notification...", "Enable the notification permission for Expo Go in settings . ");
      }

    };
    if(countDownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(countDownState.currentNotificationId);
    }
    const newCountDownState : PersistedCountdownState = {
      currentNotificationId : pushNotificationId,
      completedAt : countDownState ? [ Date.now() , ...countDownState.completedAt ] : [Date.now()]
    }
    setCountdownState(newCountDownState);
    await saveToStorage(countddownStorageKey , newCountDownState);
  }

  if(isLoading){
    
      return (
        <View style = {styles.activityIndicatorContainer}>
            <ActivityIndicator  />
        </View>
      )
  }

  return (
    <View style={[styles.container , status.isOverdue ? styles.containerLate : undefined]}>

      { status.isOverdue ? (
        <Text style ={[ styles.heading , styles.textWhite ]} > Car wash overdue by</Text>
      ) : (
        <Text style ={ styles.heading }>Car wash due in ...</Text>
      ) }
      <View style={styles.row}>
        <TimeSegment unit="days" number = {status.distance.days ?? 0} textStyle = { status.isOverdue ? styles.textWhite : undefined }/>
        <TimeSegment unit="Hours" number = {status.distance.hours ?? 0} textStyle = { status.isOverdue ? styles.textWhite : undefined }/>
        <TimeSegment unit="Minutes" number = {status.distance.minutes ?? 0} textStyle = { status.isOverdue ? styles.textWhite : undefined }/>
        <TimeSegment unit="Seconds" number = {status.distance.seconds ?? 0} textStyle = { status.isOverdue ? styles.textWhite : undefined }/>
      </View>
      <TouchableOpacity style={styles.button} onPress={scheduleNotification}>
        <Text style={styles.text}>I've washed my Car!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin = {{ x: width / 2, y: -20 }}
        autoStart = {false}
        fadeOut = {true}
      />
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
    fontSize: 12,
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 10,
    borderRadius: 5,
  },
  row : {
    flexDirection : "row",
    marginBottom : 24,
  },
  heading : {
    fontSize : 24,
    fontWeight : "bold",
    marginBottom : 24,  
  },
  containerLate : {
    backgroundColor : theme.colorRed,
  },
  textWhite : {
    color : theme.colorWhite,
  },
  activityIndicatorContainer : {
    backgroundColor : theme.colorWhite,
    justifyContent : "center",
    alignItems : "center",
    flex :1,
  }
});
