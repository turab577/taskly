import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    name?: string;
    isCompleted?: boolean
}

export function ShoppingListItem({ name, isCompleted }: Props) {
    const handleDelete = () => {
        Alert.alert(`Do you want to delete ${name}`, "It will be gone forever", [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: () => console.log("Delete Pressed"),
                style: "destructive"
            }
        ])
    }
    return (
        <View style={[styles.itemContainer, isCompleted ? styles.completedContainer : undefined]}>

            <Text style={[styles.itemText, isCompleted ? styles.completedText : undefined]}>{name}</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={handleDelete}>
                <Ionicons name="close-circle" size={24} color={isCompleted ? theme.colorGray : theme.colorRed} />
            </TouchableOpacity>
        </View>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    itemContainer: {
        borderBottomColor: theme.colorCerulean,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        padding: 14,
        borderRadius: 10
    },
    completedContainer: {
        backgroundColor: theme.colorLightGray,
        borderBottomColor: theme.colorLightGray,
    },
    itemText: {
        fontSize: 18,
        fontWeight: "200"
    },

    completedButton: {
        backgroundColor: theme.colorGray,
    },
    completedText: {
        textDecorationLine: "line-through",
        textDecorationColor: theme.colorGray,
        color: theme.colorGray
    }
});