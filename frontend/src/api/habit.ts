import apiClient, { API_URL } from ".";



export const createHabitApi = async (habitData: { name: string; icon: string; reminderEnabled?: boolean; reminderTime?: string | null }) => {
    return apiClient.post(`${API_URL}/habits`, habitData,{
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
    });
}

export const completeHabitApi = async (habitId: string) => {
    return apiClient.post(`${API_URL}/habits/${habitId}/complete-today`);
}


export const getHabitsApi = async () => {
    return apiClient.get(`${API_URL}/habits`);
}

export const updateHabitApi = async (habitId: string, habitData: { name?: string; icon?: string; reminderEnabled?: boolean; reminderTime?: string | null }) => {
    return apiClient.patch(`${API_URL}/habits/${habitId}`, habitData);
}

export const deleteHabitApi = async (habitId: string) => { 
    return apiClient.delete(`${API_URL}/habits/${habitId}`);
}

export const freezeHabitApi = async (habitId: string) => {
    return apiClient.post(`${API_URL}/habits/${habitId}/freeze-today`);
}