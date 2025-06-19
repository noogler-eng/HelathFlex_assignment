// React and necessary hooks for context and reducer
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Timer type definition
// completedAt is optional
export type Timer = {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  category: string;
  status: "running" | "paused" | "completed" | "idle";
  halfwayAlertTriggered: boolean;
  createdAt: string;
  completedAt?: string;
};

// Initial state for timers and completedTimers
// current times and completed times stored in AsyncStorage
const initialState = {
  timers: [] as Timer[],
  completedTimers: [] as Timer[],
};

// Type definition for state
// current state is same as of initialState
type State = typeof initialState;

// Reducer action types
// what actions can be performed on the state
// each action has a type and a payload
// payload is the data that is passed to the action
// Action type definitions
// ADD_TIMER, payload = Timer
// START_TIMER, payload = timer_id
// PAUSE_TIMER, payload = timer_id
// RESET_TIMER, payload = timer_id
// DELETE_TIMER, payload = timer_id
// UPDATE_TIMER_TIME, payload = { id: string, remaining: number, halfwayAlertTriggered
// COMPLETE_TIMER, payload = timer_id
// LOAD_TIMERS, payload = { timers: Timer[], completedTimers: Timer[] }
type Action =
  | { type: "ADD_TIMER"; payload: Timer }
  | { type: "START_TIMER"; payload: string }
  | { type: "PAUSE_TIMER"; payload: string }
  | { type: "RESET_TIMER"; payload: string }
  | { type: "DELETE_TIMER"; payload: string }
  | {
      type: "UPDATE_TIMER_TIME";
      payload: {
        id: string;
        remaining: number;
        halfwayAlertTriggered?: boolean;
      };
    }
  | { type: "COMPLETE_TIMER"; payload: string }
  | {
      type: "LOAD_TIMERS";
      payload: { timers: Timer[]; completedTimers: Timer[] };
    }
  | { type: "CLEAR_COMPLETED_TIMERS"; payload?: never };

// Reducer to handle all actions on timer state
// it takes current state and action as input and returns new state
function reducer(state: State, action: Action): State {
  switch (action.type) {
    // Load timers and completed timers from payload
    // this is used when app starts to load timers from AsyncStorage
    case "LOAD_TIMERS":
      return {
        timers: action.payload.timers,
        completedTimers: action.payload.completedTimers,
      };

    // Add a new timer to the state
    // this is used when user creates a new timer
    case "ADD_TIMER":
      return { ...state, timers: [...state.timers, action.payload] };

    // change the status of a timer to running
    // this is used when user starts a timer
    case "START_TIMER":
      return {
        ...state,
        timers: state.timers.map((t) =>
          t.id === action.payload ? { ...t, status: "running" } : t
        ),
      };

    // change the status of a timer to paused
    // this is used when user pauses a timer
    case "PAUSE_TIMER":
      return {
        ...state,
        timers: state.timers.map((t) =>
          t.id === action.payload ? { ...t, status: "paused" } : t
        ),
      };

    // Reset a timer to its original duration and pause it
    // this is used when user resets a timer
    // it resets the remaining time to the original duration
    // and sets the status to paused
    case "RESET_TIMER":
      return {
        ...state,
        timers: state.timers.map((t) =>
          t.id === action.payload
            ? {
                ...t,
                remaining: t.duration,
                status: "paused",
                halfwayAlertTriggered: false,
              }
            : t
        ),
      };

    // Delete a timer from the state
    // this is used when user deletes a timer
    // it removes the timer from the timers array
    case "DELETE_TIMER":
      return {
        ...state,
        timers: state.timers.filter((t) => t.id !== action.payload),
      };

    // Update the remaining time of a timer
    // this is used when the timer is running and we need to update the remaining time
    // it also updates the halfwayAlertTriggered flag if provided
    case "UPDATE_TIMER_TIME":
      return {
        ...state,
        timers: state.timers.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                remaining: action.payload.remaining,
                halfwayAlertTriggered:
                  action.payload.halfwayAlertTriggered ??
                  t.halfwayAlertTriggered,
              }
            : t
        ),
      };

    // Complete a timer and move it to completedTimers
    // this is used when a timer reaches 0 and is completed
    // it removes the timer from the timers array and adds it to completedTimers
    case "COMPLETE_TIMER":
      const completed = state.timers.find((t) => t.id === action.payload);
      return {
        timers: state.timers.filter((t) => t.id !== action.payload),
        completedTimers: completed
          ? [
              ...state.completedTimers,
              {
                ...completed,
                status: "completed",
                completedAt: new Date().toISOString(),
              },
            ]
          : state.completedTimers,
      };

    case "CLEAR_COMPLETED_TIMERS":
      // Clear all completed timers from the state
      // this is used when user clears the history of completed timers
      return {
        ...state,
        completedTimers: [],
      };

    default:
      return state;
  }
}

// Context creation to share state globally
// TimerContext will hold the state and dispatch function
const TimerContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Provider component to wrap your app
export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load timers from AsyncStorage when app starts
  useEffect(() => {
    loadTimersFromStorage();
  }, []);

  // Save to AsyncStorage on every state update
  useEffect(() => {
    saveTimersToStorage(state);
  }, [state]);

  // Read from AsyncStorage and load timers into reducer
  const loadTimersFromStorage = async () => {
    try {
      const timersData = await AsyncStorage.getItem("timers");
      const completedTimersData = await AsyncStorage.getItem("completedTimers");

      if (timersData || completedTimersData) {
        dispatch({
          type: "LOAD_TIMERS",
          payload: {
            timers: timersData ? JSON.parse(timersData) : [],
            completedTimers: completedTimersData
              ? JSON.parse(completedTimersData)
              : [],
          },
        });
      }
    } catch (error) {
      console.error("Error loading timers from storage:", error);
    }
  };

  // Save current timers to AsyncStorage
  const saveTimersToStorage = async (currentState: State) => {
    try {
      await AsyncStorage.setItem("timers", JSON.stringify(currentState.timers));
      await AsyncStorage.setItem(
        "completedTimers",
        JSON.stringify(currentState.completedTimers)
      );
    } catch (error) {
      console.error("Error saving timers to storage:", error);
    }
  };

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
};

// Hook to use the timer context in components
export const useTimers = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimers must be used within TimerProvider");
  return context;
};
