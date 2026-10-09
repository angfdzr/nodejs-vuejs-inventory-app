import { defineStore } from "pinia";
import { ref } from "vue";
import * as authService from "@/services/authService";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        user.value = res.data.data;
    };

    const logout = async () => {
        await authService.logout();
        user.value = null;
    };

    const fetchMe = async () => {
        try {
            const res = await authService.getMe();
            user.value = res.data.data;
        } catch {
            user.value = null;
        }
    };

    return { user, login, logout, fetchMe };
});