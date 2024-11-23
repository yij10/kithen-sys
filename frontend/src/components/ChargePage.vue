<template>
    <div>
      <div class="filters">
        <button
          :class="{ active: filter === 'unpaid' }"
          @click="filterOrders('unpaid')"
        >
          尚未結帳
        </button>
        <button
          :class="{ active: filter === 'paid' }"
          @click="filterOrders('paid')"
        >
          歷史訂單
        </button>
      </div>
  
      <div class="order-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-tile"
          @click="showOrderDetails(order)"
        >
          <p>桌號: {{ order.table_id }}</p>
          <p>客人: {{ order.user.name }}</p>
          <p>負責人: {{ order.handler.name }}</p>
        </div>
      </div>
  
      <OrderDetailsModal
        v-if="selectedOrder"
        :order="selectedOrder"
        :is-unpaid="filter === 'unpaid'"
        @close="selectedOrder = null"
        @checkout="handleCheckout"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import OrderDetailsModal from './OrderDetailsModal.vue';
const URL = 'http://localhost:3000/api/charge-page/';

  export default {
    components: { OrderDetailsModal },
    data() {
      return {
        orders: [], // 從後端獲取的所有訂單
        filter: 'unpaid', // 預設篩選條件
        selectedOrder: null, // 被選中的訂單
      };
    },
    computed: {
      filteredOrders() {
        return this.orders.filter((order) =>
          this.filter === 'unpaid' ? !order.paid_state : order.paid_state
        );
      },
    },
    methods: {
      async fetchOrders() {
        try {
          const response = await axios.get('/api/charge-page/');
          this.orders = response.data;
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        }
      },
      filterOrders(type) {
        this.filter = type;
      },
      showOrderDetails(order) {
        this.selectedOrder = order;
      },
      async handleCheckout(orderId) {
        try {
          const userId = sessionStorage.getItem('user_id'); // 假設目前使用者的 ID
          const response = await fetch(URL + 'confirm-charge', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem(`token`)}`, // 在 headers 中添加 token
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    order_id: orderId, // 傳送的資料
                    paid_state: true,
                    user_id: userId,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json(); // 解析後端返回的錯誤訊息
                throw new Error(errorData.message || 'Failed to checkout');
            }
        //   await axios.post('/api/charge-page/confirm-charge', {
        //     orderId,
        //     serveState: true,
        //     userId,
        //   });
          this.selectedOrder = null;
          this.fetchOrders(); // 更新訂單資料
        } catch (error) {
          console.error('Failed to checkout:', error);
        }
      },
    },
    created() {
      this.fetchOrders();
    },
  };
  </script>
  
  <style>
  .filters {
    display: flex;
    gap: 10px;
  }
  .filters button {
    padding: 10px 20px;
    cursor: pointer;
  }
  .filters .active {
    background-color: #4caf50;
    color: white;
  }
  .order-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
  .order-tile {
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
  }
  .order-tile:hover {
    background-color: #f0f0f0;
  }
  </style>
  