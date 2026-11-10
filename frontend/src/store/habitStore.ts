import { create } from "zustand";
import { completeHabitApi, createHabitApi, deleteHabitApi, getHabitsApi, updateHabitApi, freezeHabitApi } from "../api/habit";
import toast from "react-hot-toast";
import { getErrorMessage, getErrorStatus } from "../utils/error";

type HabitStatus = "ACTIVE" | "INACTIVE" | "COMPLETED";



export interface Habit {
    id: string;
    name: string;
    icon: string;
    reminderEnabled: boolean;
    reminderTime: string | null;
    status: HabitStatus;
    currentStreak: number;
    bestStreak: number;
    createdAt: string;
    updatedAt: string;
    completedToday: boolean;
    frozenToday?: boolean;
};


interface createHabitPayload {
    name: string;
    icon: string;
    reminderEnabled?: boolean;
    reminderTime?: string | null;
}

interface updateHabitPayload {
    name?: string;
    icon?: string;
    reminderEnabled?: boolean;
    reminderTime?: string | null;
}



interface HabitState {
    habits: Habit[];
    isLoading: boolean;
    error: string | null;

    createHabit: (payload: createHabitPayload) => Promise<void>;
    completeHabit: (habitId: string) => Promise<void>;
    getHabits: () => Promise<void>;
    updateHabit: (habitId: string, payload: updateHabitPayload) => Promise<void>;
    deleteHabit: (habitId: string) => Promise<void>;
    freezeHabit: (habitId: string) => Promise<void>;
}


export const useHabitStore = create<HabitState>((set,get) => ({
    habits: [],
    isLoading: false,
    error: null,
    createHabit: async (payload) => {
        set({ isLoading: true, error: null });
        const previousHabits = get().habits;

        const tempId = `temp-${Date.now()}`;
        const tempData = {
            id: tempId,
            name: payload.name,
            icon: payload.icon,
            reminderEnabled: payload.reminderEnabled ?? false,
            reminderTime: payload.reminderTime ?? null,
            status: "ACTIVE" as const,
            currentStreak: 0,
            bestStreak: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedToday: false,
        };
        try {
            set((state) => ({ habits: [...state.habits, tempData], isLoading: false }));
            const { data } = await createHabitApi(payload);
            if (!data.success) {
                throw new Error(data.message || "Failed to create habit");
            }

            set((state) => ({
                habits: state.habits.map((habit) =>
                    habit.id === tempId ? data.data : habit
                )
            }));

        } catch (error) {
            const errorMsg = getErrorMessage(error, "Failed to create habit");
            set({ habits: previousHabits, isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    completeHabit: async (habitId) => {
        try {
            set({isLoading: true, error: null });
            set((state) => ({
                habits: state.habits.map((habit) =>
                    habit.id === habitId ? { ...habit, completedToday: true } : habit
                )
            }));
            const { data } = await completeHabitApi(habitId);

            if(!data.success) {
                throw new Error(data.message || "Failed to complete habit");
            }
            set({ isLoading: false });

        } catch (error) {
            const errorMsg = getErrorMessage(error, "Failed to complete habit");
            set((state)=>({
                habits:state.habits.map((habit)=>habit.id === habitId ? {...habit,completedToday:false}:habit)
            }))
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },

    getHabits: async () => {
        if (!localStorage.getItem("accessToken")) return;
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try{
            const {data} = await getHabitsApi();
            set({ habits: data.data.habits, isLoading: false });
        }catch(error) {
            const errorMsg = getErrorMessage(error, "Failed to fetch habits");
            set({ error: errorMsg });
            if (getErrorStatus(error) !== 401) {
                toast.error(errorMsg);
            }
        }
    },

    updateHabit: async (habitId, payload) => {
        set({ isLoading: true, error: null });
        const previousHabits = get().habits;

        const tempData = {
            name: payload.name!,
            icon: payload.icon!,
            reminderEnabled: payload.reminderEnabled ?? false,
            reminderTime: payload.reminderTime || null,
        };
        set((state)=>({
            habits:state.habits.map((habit)=>habit.id === habitId ? {...habit,...tempData} : habit)
        }))
        try{
            const {data} = await updateHabitApi(habitId, payload);
            if(!data.success) {
                throw new Error(data.message || "Failed to update habit");
            }
        set((state)=>({
            habits:state.habits.map((habit)=>habit.id === habitId ? data.data : habit),
            isLoading: false
        })) 

       }catch(error) {
            const errorMsg = getErrorMessage(error, "Failed to update habit");
            set({ habits:previousHabits, isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
       }
    },
    deleteHabit: async (habitId) => {
        const previousHabits = get().habits;

        set({isLoading:true,error:null})
        set((state)=>({
            habits:state.habits.filter((habit)=>habit.id != habitId)
        }))
        try {
            const {data} = await deleteHabitApi(habitId)

            if(!data.success){
                throw new Error(data.message || "Failed to delete habit")
            }

            set({ isLoading: false })
        } catch (error) {
            set({isLoading:false,habits:previousHabits})
            const errorMsg = getErrorMessage(error, "Failed to delete habit");
            set({ error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },
    freezeHabit: async (habitId) => {
        set({isLoading:true,error:null})
        try {
            const {data} = await freezeHabitApi(habitId)
            if(!data.success){
                throw new Error(data.message || "Failed to freeze habit")
            }
            set((state) => ({
                habits: state.habits.map((habit) =>
                    habit.id === habitId ? { ...habit, frozenToday: true } : habit
                ),
                isLoading: false
            }));
        } catch (error) {
            const errorMsg = getErrorMessage(error, "Failed to freeze habit");
            set({ isLoading: false, error: errorMsg });
            toast.error(errorMsg);
            throw error;
        }
    },
}));
