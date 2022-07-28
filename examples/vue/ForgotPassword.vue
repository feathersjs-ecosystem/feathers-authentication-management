<template>
  <input v-model="email"placeholder="E-Mail"></input>
  <button @click="sendForgotPassword">Send Email</button>
</template>

<script>
import {
  ref
} from "vue-demi";

import { app } from "@/store/feathers/feathers.client";

export default {
  name: "ForgotPassword",
  setup(props) {
    const email = ref("");

    async function sendForgotPassword() {
      await app.service("auth-management").create({
        action: "sendResetPwd",
        value: { email }, // {email}, {token: verifyToken}
        notifierOptions: {}, // options passed to options.notifier, e.g. {preferredComm: 'email'}
      })
    }

    return {
      email,
      password,
      sendForgotPassword
    }
  }
};
</script>
