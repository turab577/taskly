import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, TextInput, ScrollView, FlatList, Text } from "react-native";
import { theme } from "../theme";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { Link } from "expo-router";
import { useState } from "react";
type shoppingListItemType = {
    id: string,
    name: string,
}

const initialList: shoppingListItemType[] = [
    {
        id: "1",
        name: "Ginger bread"
    },
    {
        id: "2",
        name: "Milk"
    },
    {
        id: "3",
        name: "Eggs"
    },
];

const testData = new Array(1000)
  .fill(null)
  .map((item, index) => ({
    id: String(index),
    name: String(index),
  }));



export default function App() {
    const [shoppingList, setShoppingList] = useState<shoppingListItemType[]>("");
    const [value, setValue] = useState("");
    const handleSubmit = () => {
        if (value) {
            const newShoppingList = [
                { id: new Date().toTimeString(), name: value },
                ...shoppingList
            ];
            setShoppingList(newShoppingList);
            setValue("")
        }
    }


   return (
  <FlatList
    data={shoppingList}
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
      <ShoppingListItem name={item.name} />
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