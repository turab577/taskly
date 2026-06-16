import { Tabs } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { theme } from "../theme";
export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor : theme.colorCerulean }}>
        <Tabs.Screen name="index" options={{ title : "Shopping List" , tabBarIcon : ({size , color})=>{
          return(
            <Feather name="list" size={size} color={color} />
          )
        } }} />
        <Tabs.Screen name="counter" options={{ title : "Counter" , headerShown : false , tabBarIcon : ({size , color})=>{
          return(
            <Feather name="clock" size={size} color={color} />
          )
        } }} />
        <Tabs.Screen name="idea" options={{ title : "Idea" , tabBarIcon : ({size , color})=>{
          return(
            <Entypo name="light-bulb" size={size} color={color} />
          )
        } }} />
    </Tabs>
  )
}