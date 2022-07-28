<template>
  <input v-model="email" placeholder="E-Mail"></input>
  <input v-model="username" placeholder="username"></input>
  <input v-model="password" placeholder="Password"></input>
  <!-- and whatever properties you need -->

  <button @click="signUp">Signup</button>
</template>

<script>
import {
  ref
} from "vue-demi";

import { app } from "@/store/feathers/feathers.client";

export default {
  name: "Signup",
  setup(props) {
    const email = ref("");
    const username = ref("");
    const password = ref("");
    // and whatever properties you need

    async function signUp() {
      await app.service("users").create({
        email: email.value,
        username: username.value,
        password: password.value
      });
    }

    return {
      email,
      username,
      password,
      signUp
    }
  }
};
</script>
