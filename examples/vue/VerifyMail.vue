<template>
  <div>
    {{ verifyMessage }}
  </div>
</template>

<script>
import {
  ref
} from "vue-demi";

import { app } from "@/store/feathers/feathers.client";

export default {
  name: "VerifyMail",
  props: {
    token: {
      type: string,
      required: true
    }
  },
  setup(props) {
    const verifyMessage = ref("We're verifying your token. Please wait.")

    async function verify() {
      try {
        await app.service("auth-management").create({
          action: "verifySignupLong",
          value: props.token,
          notifierOptions: {}, // options passed to options.notifier, e.g. {preferredComm: 'email'}
        })
        verifyMessage.value = "Your Mail was verified successfully!"

        // router.push("/home");
      } catch (err) {
        verifyMessage.value = "Your Mail cannot be verified!"
      }
    }

    verify();

    return {
      verifyMessage
    }
  }
};
</script>
