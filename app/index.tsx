import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, TextInput, ScrollView, FlatList, Text , LayoutAnimation, Platform, UIManager } from "react-native";
import * as Haptics from "expo-haptics";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { theme } from "../theme";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../utils/storage";

const storageKey = "shoppingList";

type shoppingListItemType = {
    id: string,
    name: string,
    completedAtTimestamp?: number,
    lastUpdatedTimestamp : number
}

const testData = new Array(1000)
  .fill(null)
  .map((item, index) => ({
    id: String(index),
    name: String(index),
  }));



export default function App() {
    const [shoppingList, setShoppingList] = useState<shoppingListItemType[]>([]);
    const [value, setValue] = useState("");

    useEffect(()=>{
       const fetchInitial = async ()=>{
        const data = await getFromStorage(storageKey);
        if(data){
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          setShoppingList(data)
        }
       };
      fetchInitial()
    } , [])

    const handleSubmit = () => {
        if (value) {
            const newShoppingList = [
                { id: new Date().toTimeString(), name: value , lastUpdatedTimestamp: Date.now() },
                ...shoppingList
            ]; 
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            setShoppingList(newShoppingList);
            saveToStorage(storageKey , newShoppingList);
            setValue("")
        }
    }

    const handleDelete = (id : string)=>{
        const newShoppingList = shoppingList.filter(item => item.id !== id);
        saveToStorage(storageKey , newShoppingList);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShoppingList(newShoppingList);
    }

    const handleToggleComplete = (id : string)=>{
        const newShoppingList = shoppingList.map((item)=>{
            if( item.id == id){
              if(item.completedAtTimestamp){
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
                return {
                    ...item,
                    lastUpdatedTimestamp : Date.now(),
                    completedAtTimestamp : item.completedAtTimestamp ? undefined : Date.now(),
                }
            }
            return item; 
        });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        saveToStorage(storageKey , newShoppingList);
        setShoppingList(newShoppingList);
    }

   return (
  <FlatList
    data={orderShoppingList(shoppingList)}
    style={styles.container}

    ListHeaderComponent={
      <TextInput
        placeholder="e.g. coffee"
        value={value}
        onChangeText={setValue}
        returnKeyType="done"
        style={styles.textInput}
        onSubmitEditing={handleSubmit}
      />
    }
    renderItem={({ item }) => (
      <ShoppingListItem name={item.name} onDelete = {()=>{handleDelete(item.id)}} onToggleComplete={()=>handleToggleComplete(item.id)}
      isCompleted={Boolean(item.completedAtTimestamp)}
      />
    )}
    stickyHeaderIndices={[0]}
    ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
            <Text>
            Your shopping list is empty.
            </Text>
        </View>
    }
  />
);
}


function orderShoppingList(shoppingList: shoppingListItemType[]) {
  return shoppingList.sort((item1, item2) => {
    if (item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return item2.completedAtTimestamp - item1.completedAtTimestamp;
    }

    if (item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return 1;
    }

    if (!item1.completedAtTimestamp && item2.completedAtTimestamp) {
      return -1;
    }

    if (!item1.completedAtTimestamp && !item2.completedAtTimestamp) {
      return item2.lastUpdatedTimestamp - item1.lastUpdatedTimestamp;
    }

    return 0;
  });
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: "#fff",
    },
    contentContainer: {
        paddingBottom: 24,
    },

    textInput: {
        borderColor: theme.colorLightGray,
        borderWidth: 2,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 12,
        marginBottom    : 12,
        fontSize: 18,
        borderRadius: 50,
        backgroundColor: theme.colorWhite,
    },

    listEmptyContainer : {
        justifyContent : "center",
        alignItems : "center",
        marginVertical : 18,
    }

});