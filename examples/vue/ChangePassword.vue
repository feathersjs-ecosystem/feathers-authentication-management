<template>
  <input v-model="oldPassword" placeholder="Old password"></input>
  <input v-model="newPassword" placeholder="New password"></input>
  <input v-model="passwordConfirm" placeholder="Confirm password"></input>

  <button @click="changePassword">Reset password</button>
</template>

<script>
import {
  ref
} from "vue-demi";

import { app } from "@/store/feathers/feathers.client";

import { useStore } from 'vuex'

export default {
  name: "ChangePassword",
  setup(props) {
    const oldPassword = ref("");
    const newPassword = ref("");
    const passwordConfirm = ref("");

    const store = useStore();

    async function changePassword() {
      const user = store.getters["auth/user"];


      if (newPassword.value !== passwordConfirm.value) {
        // error handling
      }

      await app.service("auth-management").create({
        action: "passwordChange",
        value: {
          oldPassword: oldPassword.value,
          password: newPassword.value,
          user
        },
        notifierOptions: {}, // options passed to options.notifier, e.g. {preferredComm: 'email'}
      })
    }

    return {
      oldPassword,
      newPassword,
      passwordConfirm,
      changePassword
    }
  }
};
</script>
