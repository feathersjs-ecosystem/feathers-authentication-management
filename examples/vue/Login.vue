<template>
  <input v-model="email" placeholder="E-Mail"></input>
  <input v-model="password" placeholder="Password"></input>

  <button @click="signIn">Login</button>
</template>

<script>
import {
  ref
} from "vue-demi";

import { app } from "@/store/feathers/feathers.client";

export default {
  name: "Login",
  setup(props) {
    const email = ref("");
    const password = ref("");

    async function signIn() {
      await app.authenticate({
        strategy: "local",
        email: email.value,
        password: password.value
      });
    }

    return {
      email,
      password,
      signIn
    }
  }
};
</script>
