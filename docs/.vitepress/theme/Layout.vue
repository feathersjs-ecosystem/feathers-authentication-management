<!--.vitepress/theme/Layout.vue-->
<script setup lang="ts">
import DefaultTheme from "vitepress/theme"
import "./store"
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-after>
      <!-- <div>My custom sidebar top content</div> -->
    </template>
  </Layout>
</template>
