import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';

type Props = {
    name?: string;
    isCompleted?: boolean;
    onDelete: () => void
    onToggleComplete: () => void
}

export function ShoppingListItem({ name, isCompleted, onDelete, onToggleComplete }: Props) {
    const handleDelete = () => {
        Alert.alert(`Do you want to delete ${name}`, "It will be gone forever", [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: () => onDelete(),
                style: "destructive"
            }
        ])
    }
    return (
        <Pressable onPress={onToggleComplete} style={[styles.itemContainer, isCompleted ? styles.completedContainer : undefined]}>
            <View style = {styles.row}>
            <Entypo name={isCompleted ? "check" : "circle"} size={24} color={ isCompleted ? theme.colorGray : theme.colorCerulean } />          
              <Text numberOfLines={1} style={[styles.itemText, isCompleted ? styles.completedText : undefined]}>{name}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={handleDelete}>
                <Ionicons name="close-circle" size={24} color={isCompleted ? theme.colorGray : theme.colorRed} />
            </TouchableOpacity>
        </Pressable>
    );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingVertical: 12,
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
        fontWeight: "200",  
        flex : 1,
    },

    completedButton: {
        backgroundColor: theme.colorGray,
    },
    completedText: {
        textDecorationLine: "line-through",
        textDecorationColor: theme.colorGray,
        color: theme.colorGray
    },
    row : {
        flexDirection : "row",
        gap : 8,
        flex : 1,
    }
});