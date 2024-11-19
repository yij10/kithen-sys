<template>
    <div>
        <h1>訂單列表</h1>
        <div id="controls">
            <div id="choose-state">
                <label>
                    <input type="checkbox" v-model="selectedStates.pending" @change="fetchOrders">
                    Pending
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.preparing" @change="fetchOrders">
                    Preparing
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.waiting" @change="fetchOrders">
                    Waiting for Delivery
                </label>
                <label>
                    <input type="checkbox" v-model="selectedStates.completed" @change="fetchOrders">
                    Completed
                </label>
            </div>
            <button @click="toggleDisplayMode">{{ displayMode }}</button>
        </div>
        <div id="orders-container">
            <!-- 桌號分 -->
             <div v-if="displayMode === 'grouped'">
                <div v-for="(orders, tableId) in groupedOrders" :key="tableId" class="table-block">
                    <h3>桌號：{{ tableId }}</h3>
                    <div v-for="order in orders" :key="order.order_id" class="order-item">
                        <p>品項：{{order.Product.name}}</p>
                        <div v-for="option in order.Options" :key="option.name">
                            <p>{{ option.Option_Type.name }}：{{ option.name }}</p>
                        </div>
                        <label :for="'state-select-' + order.order_id">State:</label>
                        <select :id="'state-select-' + order.order_id" v-model="order.serve_state" @change="updateOrderState(order.order_id)">
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="waiting for delivery">Waiting for Delivery</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
             </div>

            <!-- Sorted Mode -->
            <div v-else>
                <div v-for="order in sortedOrders" :key="order.order_id" class="time-block">
                    <p>點餐時間：{{ order.order_time }}</p>
                    <p>品項：{{ order.Product.name }}</p>
                    <div v-for="option in order.Options" :key="option.name" class="time-child">
                        <p>{{ option.Option_Type.name }}: {{ option.name }}</p>
                    </div>
                    <label :for="'state-select-' + order.order_id">State:</label>
                    <select :id="'state-select-' + order.order_id" v-model="order.serve_state" @change="updateOrderState(order.order_id)">
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="waiting for delivery">Waiting for Delivery</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
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
            selectedStates: {
                pending: true,
                preparing: true,
                waiting: true,
                completed: true,
            }
        };
    },

    computed: {
        // 案桌號分成同一張訂單
        groupedOrders() {
            return this.orders.reduce((groups, order) => {
                if (!groups[order.table_num_id]) {
                    groups[order.table_num_id] = [];
                }
                groups[order.table_num_id].push(order);
                return groups;
            });
        },

        // 按點餐時間排序
        sortedOrders() {
            return [...this.orders].sort((a, b) => {
                // 轉換成Date 物件才能比大小
                const dateA = new Date(a.order_time);
                const dateB = new Date(b.order_time);

                return dateA - dateB;
            });
        }
    },

    methods: {
        toggleDisplayMode() {
            this.displayMode = (this.displayMode === "grouped") ? "sorted" : "grouped";
            this.fetchOrders();
        },

        async fetchOrders() {
            try {
                const response = await fetch(URL + "/api/orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(this.selectedStates)
                });
                this.orders = await response.json();
            } catch (error) {
                console.error("Error in fetch orders", error);
            }
        },

        async updateOrderState(orderId) {
            const order = this.orders.find(order => order.order_id === orderId);
            try {
                const response = await fetch(URL + `/api/orders/${orderId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({state: order.serve_state})
                });
                if (!response.ok) throw new Error('Failed to update order state');
                console.log(`Order ${orderId} state updated to ${order.serve_state}`);
            } catch (error) {
                console.error("Error in update order state", error);
            }
        }
    },

    mounted() {
        this.fetchOrders();
    }
};
</script>



<style scoped>
.table-block {
    border: 2px solid #000;
    margin: 10px 0;
    padding: 10px;
}
.order-item {
    padding: 5px;
    border-bottom: 1px solid #d3d3d3;
}
.order-item:last-child {
    border-bottom: none;
}
.time-block {
    border: 2px solid #000;
    margin: 10px 0;
    padding: 10px;
}
</style>