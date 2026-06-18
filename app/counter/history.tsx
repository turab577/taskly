
import { useEffect, useState } from "react";
import { Text, View, StyleSheet , FlatList } from "react-native";
import { countddownStorageKey, PersistedCountdownState } from ".";
import { getFromStorage } from "../../utils/storage";
import { format } from "date-fns";
import { theme } from "../../theme";

const fullDateFormat = "LLL d yyyy, h:mm aaa";


export default function HistoryScreen() { 
  const [ countDownState , setCountDownState ] = useState<PersistedCountdownState>();

  useEffect(()=>{
      const init = async () => {
        const value = await getFromStorage(countddownStorageKey);
        setCountDownState(value);
      }
      init ()
    } , [])


  return (
    <FlatList 
    style={styles.list}
    contentContainerStyle={styles.contentContainer}
    data = {countDownState?.completedAt}
    ListEmptyComponent = {
        <View style={styles.listEmptyContainer}>
                  <Text>
                 No history
                  </Text>
              </View>
    }
    renderItem = {({item})=>{
     return ( 
     <View style = {styles.listitems}>
        <Text style = {styles.listItemText}>
          { format(item , fullDateFormat) }
        </Text>
       </View> )
    }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
  list :{
    flex : 1,
    backgroundColor : theme.colorWhite,
  },
  contentContainer : {
    marginTop : 8,
  },
  listitems : {
    backgroundColor : theme.colorLightGray,
    marginHorizontal : 8,
    padding : 12,
    borderRadius : 6,
    marginBottom : 8,
  },
  listItemText : {
    fontSize : 18,
  },
   listEmptyContainer : {
        justifyContent : "center",
        alignItems : "center",
        marginVertical : 18,
    }
});

