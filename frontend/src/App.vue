<template>
  <div id="app">
    <div v-if="notification.visible" :class="['notification', notification.type]">
        {{ notification.message }}
    </div>
    <!-- 懸浮登入視窗 -->
    <LoginModal v-if="!isLoggedIn" @loginSuccess="handleLoginSuccess" />

    <!-- 主頁面內容 -->
    <div v-if="isLoggedIn">
      <header>
        <div class="user-menu">
          <span>Welcome, {{ userName }}</span>
          <button @click="toggleDropMenu">▼</button>
        </div>
        <div v-if="dropMenu" class="dropdown">
          <button @click="logout">Log Out</button>
        </div>
      </header>
    </div>

    <nav>
      <router-link to="/show-orders">訂單列表</router-link> |
      <router-link to="/manu-management">管理菜單</router-link> |
      <router-link to="charge-page">結帳系統</router-link>
    </nav>

    <div>    <!--左上角的選單-->
      <div class="hamburger-menu" @click="toggleMenu">
        <!-- 三條橫線圖示 -->
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div v-if="menuOpen" class="side-menu">
        <router-link to="/menu-management">管理菜單</router-link>
      </div>
      
      <!-- 其他內容 -->
    </div>
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import LoginModal from './components/LoginModal.vue';
// import axios from 'axios';


  export default {
    components: { LoginModal },
    data() {
      return {
        isLoggedIn: false,
        menuOpen: false,
        dropMenu: false,
        userName: "",
        notification: {
            message: '',
            type: '',  // success or error
            visible: false
        },
      };
    },

    created() {
      this.isLoggedIn = !!sessionStorage.getItem('token');
      this.userName = sessionStorage.getItem('user_name');
    },
    methods: {
      showNotification(message, type) {
          this.notification.message = message;
          this.notification.type = type;
          this.notification.visible = true;
          
          setTimeout(() => {
              this.notification.visible = false;
          }, 5000); // 五秒後隱藏通知
      },
      handleLoginSuccess() {
        this.isLoggedIn = true;
      },
      logout() {
        sessionStorage.removeItem('token');
        this.isLoggedIn = false;
        this.dropMenu = false;
      },
      toggleMenu() {
          this.menuOpen = !this.menuOpen;
      },
      toggleDropMenu() {
        this.dropMenu = !this.dropMenu;
      }
    },
    computed: {
        ...mapState(['isAuthenticated', 'token']),
    },
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.hamburger-menu {
    position: fixed; /* 固定位置 */
    top: 10px;       /* 距離視窗頂部 10px */
    left: 10px;      /* 距離視窗左側 10px */
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.hamburger-menu span {
    width: 25px;
    height: 3px;
    background-color: #333;
}

.side-menu {
    position: fixed; /* 固定位置 */
    top: 30px;
    left: 10px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-menu {
  position: fixed;
  top: 10px;
  right: 10px;
}
.dropdown {
  position: fixed;
  top: 30px;
  right: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
