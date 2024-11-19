<!-- src/components/LoginModal.vue -->
<template>
  <div class="login-modal">
    <div class="modal-content">
      <h2>Log In</h2>
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Log In</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        errorMessage: ''
      };
    },
    methods: {
      async login() {
        try {
          const response = await axios.post('/api/auth/login', {
            email: this.email,
            password: this.password
          });
          console.log(response);
          // 儲存 token 並發送登入成功事件
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem('user_name', response.data.name);
          sessionStorage.setItem('user_id', response.data.id);

          this.$emit('loginSuccess');
        } catch (error) {
          this.errorMessage = 'Login failed, please try again.';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* 加上適當的樣式讓視窗居中顯示 */
  .login-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
  }
  .error {
    color: red;
    margin-top: 10px;
  }
  </style>
  