import { Text, View, StyleSheet, TouchableOpacity, Animated, Alert } from "react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "../theme";
import { TimeSegment } from "../components/TimeSegment";
import { getFromStorage, saveToStorage } from "../utils/storage";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const focusStorageKey = "focus_sessions";

type Phase = "focus" | "break";

type PersistedFocusState = {
  date: string; // YYYY-MM-DD, used to reset count daily
  count: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function phaseLength(phase: Phase) {
  return phase === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
}

export default function FocusScreen() {
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;

  // Load today's completed-session count (reset if stored date is stale).
  useEffect(() => {
    const init = async () => {
      const value: PersistedFocusState | null = await getFromStorage(focusStorageKey);
      if (value && value.date === todayKey()) {
        setSessionsToday(value.count);
      }
    };
    init();
  }, []);

  // Drive the progress bar whenever the remaining time changes.
  useEffect(() => {
    const elapsed = phaseLength(phase) - secondsLeft;
    Animated.timing(progress, {
      toValue: elapsed / phaseLength(phase),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [secondsLeft, phase, progress]);

  const fireNotification = useCallback(async (title: string) => {
    const result = await Notifications.getPermissionsAsync();
    let granted = result.granted;
    if (!granted) {
      granted = (await Notifications.requestPermissionsAsync()).granted;
    }
    if (granted) {
      await Notifications.scheduleNotificationAsync({
        content: { title },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });
    }
  }, []);

  const goToNextPhase = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (phase === "focus") {
      // A focus block finished — count it and persist for today.
      const next = sessionsToday + 1;
      setSessionsToday(next);
      await saveToStorage(focusStorageKey, { date: todayKey(), count: next });
      await fireNotification("Focus done! Take a 5 min break ☕");
      setPhase("break");
      setSecondsLeft(BREAK_SECONDS);
    } else {
      await fireNotification("Break over — back to focus 🎯");
      setPhase("focus");
      setSecondsLeft(FOCUS_SECONDS);
    }
    setIsRunning(false);
  }, [phase, sessionsToday, fireNotification]);

  // Countdown ticker.
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          goToNextPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, goToNextPhase]);

  const toggleRunning = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning((r) => !r);
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
    setSecondsLeft(phaseLength(phase));
  };

  const skip = () => {
    Alert.alert(
      `Skip this ${phase} block?`,
      phase === "focus"
        ? "It won't be counted as a completed session."
        : "Jump straight back to focus.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          style: "destructive",
          onPress: () => {
            const nextPhase: Phase = phase === "focus" ? "break" : "focus";
            setPhase(nextPhase);
            setSecondsLeft(phaseLength(nextPhase));
            setIsRunning(false);
          },
        },
      ]
    );
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isFocus = phase === "focus";

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, isFocus ? styles.focusBg : styles.breakBg]}>
      <Text style={styles.phaseLabel}>{isFocus ? "FOCUS" : "BREAK"}</Text>

      <View style={styles.row}>
        <TimeSegment unit="Minutes" number={minutes} />
        <Text style={styles.colon}>:</Text>
        <TimeSegment unit="Seconds" number={seconds} />
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: widthInterpolate, backgroundColor: isFocus ? theme.colorCerulean : theme.colorRed },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
          <Feather name="rotate-ccw" size={22} color={theme.colorCerulean} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, isFocus ? styles.focusButton : styles.breakButton]}
          onPress={toggleRunning}
        >
          <Feather name={isRunning ? "pause" : "play"} size={28} color={theme.colorWhite} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={skip}>
          <Feather name="skip-forward" size={22} color={theme.colorCerulean} />
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        🎯 {sessionsToday} focus {sessionsToday === 1 ? "session" : "sessions"} today
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  focusBg: {
    backgroundColor: theme.colorWhite,
  },
  breakBg: {
    backgroundColor: theme.colorLightGray,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 4,
    color: theme.colorGray,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  colon: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colorLightGray,
    overflow: "hidden",
    marginBottom: 36,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
    marginBottom: 36,
  },
  primaryButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  focusButton: {
    backgroundColor: theme.colorCerulean,
  },
  breakButton: {
    backgroundColor: theme.colorRed,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colorCerulean,
  },
  counter: {
    fontSize: 16,
    color: theme.colorGray,
  },
});
