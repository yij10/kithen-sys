<template>
    <div class="modal-backdrop">
      <div class="modal">
        <h2>訂單詳細資訊</h2>
        <p><strong>桌號:</strong> {{ order.table_id }}</p>
        <div v-for="product in order.Order_Products" :key="product.id" class="product">
          <p>
            <strong>{{ product.Product.name }}</strong>
            <span> ${{ product.Product.price }}</span>
          </p>
          <ul v-if="product.Options.length" class="options">
            <li v-for="option in product.Options" :key="option.name">
              <small style="color: grey">
                {{ option.Option_Type.name }}: {{ option.name }} (+${{ option.price }})
              </small>
            </li>
          </ul>
        </div>
        <div v-if="order.Coupons.length" class="coupons">
          <p><strong>折扣:</strong></p>
          <ul>
            <li v-for="coupon in order.Coupons" :key="coupon.name">
              {{ coupon.name }}
            </li>
          </ul>
        </div>
        <hr />
        <p><strong>小計:</strong> ${{ order.price }}</p>
        <div class="actions">
          <button @click="$emit('close')">關閉</button>
          <button v-if="isUnpaid" @click="confirmCheckout">結帳</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      order: { type: Object, required: true },
      isUnpaid: { type: Boolean, required: true },
    },
    methods: {
      confirmCheckout() {
        if (confirm('確定要結帳嗎？')) {
          this.$emit('checkout', this.order.id);
        }
      },
    },
  };
  </script>
  
  <style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
  }
  .product {
    margin-bottom: 10px;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  </style>
  