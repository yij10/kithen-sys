<template>
    <div>
        <h1>訂單列表</h1>
        <div v-if="notification.visible" :class="['notification', notification.type]">
            {{ notification.message }}
        </div>
        <div id="controls">
            <div>
                <label>
                    <input type="checkbox" v-model="selectedStates.pending" @change="fetchOrders" checked>
                    Pending
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.preparing" @change="fetchOrders" checked>
                    Preparing
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.waiting" @change="fetchOrders" checked>
                    Waiting for Delivery
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.completed" @change="fetchOrders" checked>
                    Completed
                </label>
            </div>
            <button @click="toggleDisplayMode">{{ displayMode }}</button>
        </div>
        <div id="orders-container">
            <!-- Grouped Mode -->
            <div v-if="displayMode === 'grouped'">
                <div v-for="(orders, tableId) in groupedOrders" :key="tableId" class="table-block">
                    <h3>桌號: {{ tableId }}</h3>
                    <div v-for="order in orders" :key="order.order_id" class="order-item">
                        <p>品項: {{ order.Product.name }}</p>
                        <div v-for="option in order.Options" :key="option.name">
                            <p>{{ option.Option_Type.name }}: {{ option.name }}</p>
                        </div>
                        <label :for="'state-select-' + order.id">State:</label>
                        <select :id="'state-select-' + order.id" v-model="order.serve_state" @change="updateOrderState(order.id)">
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="waiting for delivery">Waiting for Delivery</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button @click="confirmDelete(order.id)">Delete</button> <!-- 新增刪除按鈕 -->
                        <p>目前負責人: {{order.handler_id || "無"}}</p>
                    </div>
                </div>
            </div>

            <!-- Sorted Mode -->
            <div v-else>
                <div v-for="order in sortedOrders" :key="order.id" class="time-block">
                    <p>點餐時間: {{ order.createdAt }}</p>
                    <p>Item: {{ order.Product.name }}</p>
                    <div v-for="option in order.Options" :key="option.name" class="time-child">
                        <p>{{ option.Option_Type.name }}: {{ option.name }}</p>
                    </div>
                    <label :for="'state-select-' + order.id">State:</label>
                    <select :id="'state-select-' + order.id" v-model="order.serve_state" @change="updateOrderState(order.id)">
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="waiting for delivery">Waiting for Delivery</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button @click="confirmDelete(order.id)">Delete</button> <!-- 新增刪除按鈕 -->
                    <p>目前負責人: {{order.handler_id || "無"}}</p>
                </div>
            </div>
        </div>

        <div v-if="showDeleteDialog" class="delete-dialog"> <!-- 確認刪除的提示欄-->
            <p>確定要取消嗎？</p>
            <button @click="deleteOrder">是</button>
            <button @click="cancelDelete">否</button>
        </div>
    </div>
</template>

<script>
const URL = "http://localhost:3000";
export default {
    data() {
        return {
            displayMode: 'grouped',
            orders: [],
            loading: true,
            error: null,
            selectedStates: {
                pending: true,
                preparing: true,
                waiting: true,
                completed: true,
            },
            notification: { // 新增 notification 資料屬性
                message: '',
                type: '',  // success or error
                visible: false
            },
            showDeleteDialog: false,  // 控制刪除對話框顯示
            orderIdToDelete: null,     // 保存待刪除的訂單 ID
        };
    },

    computed: {
        groupedOrders() {
            return this.orders.reduce((groups, order) => {
                if (!groups[order.Order.table_id]) {
                    groups[order.Order.table_id] = [];
                }
                groups[order.Order.table_id].push(order);
                return groups;
            }, {});
        },
        sortedOrders() {
            return [...this.orders].sort((a, b) => {
                // 轉換為 Date 物件才能比大小
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                
                return dateA - dateB; 
            });
        }
    },
    methods: {
        toggleDisplayMode() {
            this.displayMode = this.displayMode === 'grouped' ? 'sorted' : 'grouped';
            this.fetchOrders();
            },
        async fetchOrders() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(URL + "/api/orders", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.selectedStates)
                });
                if (!response.ok) throw new Error('Failed to fetch orders');
                this.orders = await response.json();
            } catch (error) {
                console.error('Error fetching orders:', error);
                this.error = 'Failed to fetch orders';
            } finally {
                this.loading = false;
            }
        },

        async updateOrderState(orderId) {
            const order = this.orders.find(order => order.id === orderId);
            try {
                const response = await fetch(URL + `/api/orders/${orderId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem(`token`)}`, // 在 headers 中添加 token
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ state: order.serve_state })
                });
                if (!response.ok) throw new Error('Failed to update order state');
                console.log(`Order ${orderId} state updated to ${order.serve_state}`);
                this.showNotification(`Order ${orderId} state updated to ${order.serve_state}`, 'success');
                this.fetchOrders();
            } catch (error) {
                this.showNotification('Failed to update order state', 'error');
                console.error('Error updating order state:', error);
            }
        },

        showNotification(message, type) {
            this.notification.message = message;
            this.notification.type = type;
            this.notification.visible = true;
            
            setTimeout(() => {
                this.notification.visible = false;
            }, 5000); // 五秒後隱藏通知
        },
        confirmDelete(orderId) {
            this.showDeleteDialog = true;
            this.orderIdToDelete = orderId;
        },
        async deleteOrder() {
            try {
                const response = await fetch(URL + `/api/orders/${this.orderIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem(`token`)}`, // 在 headers 中添加 token
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Failed to delete order');
                this.showNotification(`Order ${this.orderIdToDelete} has been deleted.`, 'success');
                this.orders = this.orders.filter(order => order.id !== this.orderIdToDelete);
                this.fetchOrders();
            } catch (error) {
                console.error('Error deleting order:', error);
                this.showNotification('Failed to delete order', 'error');
            } finally {
                this.showDeleteDialog = false;
                this.orderIdToDelete = null;
            }
        },
        cancelDelete() {
            this.showDeleteDialog = false;
            this.orderIdToDelete = null;
        }
    },
    mounted() {
        this.fetchOrders();
    }
};
</script>

<style scoped>

.table-block {
    width: 90%; /* 佔父容器的90% */
    max-width: 350px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    border: 2px solid #000;
    padding: 10px;
    border-radius: 10px;
}
.order-item, .time-block {
    width: 90%; /* 佔父容器的90% */
    max-width: 300px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    background-color: #ffffff; /* 卡片背景色 */
    border-radius: 10px;       /* 圓角 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.662); /* 陰影效果 */
    padding: 15px;             /* 內邊距 */
    margin-bottom: 15px;       /* 每個卡片之間的間距 */
    transition: transform 0.2s ease-in-out; /* 動態效果 */
}

.order-item:hover, .time-block:hover {
    transform: translateY(-5px); /* 滑過時微微上移 */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.998); /* 增強陰影 */
}

/* 標題樣式 */
h3 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
}

/* 選項和訂單資訊的樣式 */
.order-item p, .time-block p {
    margin: 5px 0;
    color: #555;
}

/* 按鈕樣式 */
button {
    background-color: #4e4e4e; /* 按鈕背景色 */
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #3a3a3a; /* 滑過時顏色變深 */
}

/* 狀態選擇的樣式 */
select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-top: 5px;
    width: 100%;
}

select:hover {
    background-color: #b6b6b6;
}

/* 卡片內的按鈕調整 */
.order-item button, .time-block button {
    margin-top: 10px;
    display: inline-block;
    width: 100%; /* 按鈕寬度調整，使其充滿卡片的寬度 */
}

.notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 16px;
    color: #fff;
    z-index: 1000;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

.delete-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: white;
    border: 2px solid #000;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    z-index: 1000; /* 讓對話框出現在其他元素上方 */
}

.notification.success {
    background-color: #4caf50;
}

.notification.error {
    background-color: #f44336;
}

</style>
