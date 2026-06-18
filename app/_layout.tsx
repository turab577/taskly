import { Tabs } from "expo-router";
import Feather from '@expo/vector-icons/Feather';
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
        <Tabs.Screen name="focus" options={{ title : "Focus" , tabBarIcon : ({size , color})=>{
          return(
            <Feather name="target" size={size} color={color} />
          )
        } }} />
    </Tabs>
  )
}