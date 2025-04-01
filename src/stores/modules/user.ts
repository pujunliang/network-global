import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";

export const useUserStore = defineStore({
    id: "vis-user",
    state: (): UserState => ({
        token: "",
        userInfo: { name: "Admin" }
    }),
    getters: {},
    actions: {
        /**
         * Set Token
         * @param token
         */
        setToken(token: string) {
            this.token = token;
        },
        /**
         * Set setUserInfo
         * @param userInfo
         */
        setUserInfo(userInfo: UserState["userInfo"]) {
            this.userInfo = userInfo;
        }
    },
    persist: piniaPersistConfig("vis-user")
});
