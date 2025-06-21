<script setup lang="ts">
import { RouterView } from 'vue-router'
import GoogleAuth from './components/GoogleAuth.vue'
import AppleAuth from './components/AppleAuth.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Vue 3 OAuth 整合測試</h1>

      <div class="auth-container">
        <!-- Google OAuth 組件 -->
        <div class="auth-section">
          <h2>Google 登入</h2>
          <GoogleAuth />
        </div>

        <!-- Apple OAuth 組件 -->
        <div class="auth-section">
          <h2>Apple 登入</h2>
          <AppleAuth />
        </div>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.auth-section {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-background-soft);
}

.auth-section h2 {
  margin: 0 0 1rem 0;
  text-align: center;
  color: var(--color-heading);
  font-size: 1.25rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
