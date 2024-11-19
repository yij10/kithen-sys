<template>
    <div>
        <h1>管理菜單</h1>
        <div v-if="notification.visible" :class="['notification', notification.type]">
            {{ notification.message }}
        </div>

        <div v-if="menu.length > 0" id="id-container">
            <!-- 按照 Category 分類 -->
            <div v-for="category in menu" :key="category.id" class="category-block">
                <h2 class="category-title">{{ category.name }}</h2>
                <div v-for="item in category.Products" :key="item.id" class="item-card">
                    <label>品項名稱:</label>
                    <input v-model="item.name" class="item-name-input"/>

                    <label>價格:</label>
                    <input v-model="item.price" class="item-name-input">
                    
                    <label>產品敘述:</label>
                    <textarea v-model="item.description" class="editable-input"></textarea>

                    <label>供應中:</label>
                    <select v-model="item.available" class="select-input">
                        <option :value="true">是</option>
                        <option :value="false">否</option>
                    </select>

                    <label>客製化選項:</label>
                    <div class="options-container">
                        <div v-for="option in item.Option_Types" :key="option.id" class="option-box">
                            <span @click="removeOption(item, option)" class="remove-icon">×</span>
                            {{ option.name }}
                        </div>
                        <div class="add-option" @click="toggleShowOption()">+ 新增客製化選項</div>

                        <div v-if="showOptionList" class="option-list">
                            <div v-for="option in allOptions" :key="option.id" @click="addOption(option, item.id)" class="option-item">
                            {{ option.name }}
                            </div>
                        </div>

                    </div>

                    <div class="item-actions">
                        <button @click="saveChanges(item)">確認更改</button>
                        <button @click="cancelChanges(item)">取消</button>
                    </div>
                </div>
            </div>
        </div>
  
    </div>
</template>

<script>
const URL = 'http://localhost:3000/api/menu-management/';
export default {
    data() {
        return {
            notification: {
                message: '',
                type: '',  // success or error
                visible: false
            },
            menu: [], 
            modifiedItems: null,
            allOptions: [],
            showOptionList: false
        };
    },

    computed: {
        organize_by_category() {
            return this.menu.reduce((groups, menu_it) => {
                if(!groups[menu_it.Category.id]) {
                    groups[menu_it.Category.id] = [];
                }
                groups[menu_it.Category.id].push(menu_it);
                return groups;
            }, {});
        }
    },

    methods: {
        async fetchMenu() {

            try {
                this.modifiedItems = null;
                const response = await fetch(URL + 'show-menu', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem(`token`)}`, // 在 headers 中添加 token
                        'Content-Type': 'application/json'
                    }
                });

                if(!response.ok) throw new Error('Failed to fetch menu');
                this.menu = await response.json();
            } catch (error) {
                console.error('Error fetching menu: ', error);
            }
        },

        async fetchOption() {
            try {
                const response = await fetch(URL + 'get-all-options', {
                    method: 'GET'
                });

                if(!response.ok) throw new Error('Failed to fetch menu');
                this.allOptions = await response.json();
            } catch (error) {
                console.error('Error fetching options: ', error);
            }
        },

        toggleShowOption() {
            this.showOptionList = !this.showOptionList;
            this.fetchOption();
        },

        saveChanges(item) {
            // 實作保存更改並更新後端
            fetch(`${URL}update-item/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // 添加 token
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item) // 將 item 轉為 JSON 格式並發送
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('更新失敗');
                }
                return response.json();
            })
            .then(data => {
                // 顯示成功通知
                this.showNotification("菜單變更成功", "success");

                // 選擇性地更新本地的 menu 資料（若後端返回新的 item）
                const category = this.menu.find(c => c.Products.some(p => p.id === item.id));
                if (category) {
                    const productIndex = category.Products.findIndex(p => p.id === item.id);
                    if (productIndex !== -1) {
                        // 更新當前產品的數據
                        this.$set(category.Products, productIndex, data);
                    }
                }
            })
            .catch(error => {
                console.error('Error updating item:', error);
                this.showNotification("更新失敗，請稍後再試", "error");
            });
            this.showNotification("菜單變更成功", "success");
        },

        cancelChanges(item) {
            console.log(item);
            // 實作取消更改並還原原始數據
            this.fetchMenu();
            this.showNotification("變更已取消", "error");
        },

        removeOption(item, option) {
            // 感覺會影響relation，之後再做
            item.Option_Types = item.Option_Types.filter(o => o.id !== option.id);
        },

        addOption(option, productId) {
            // 找到對應的 category 和 product
            const category = this.menu.find(c => c.Products.some(p => p.id === productId));
            if (!category) return;

            const product = category.Products.find(p => p.id === productId);
            if (!product) return;

            // 確認該選項尚未存在於 Option_Types 中
            const existingOption = product.Option_Types.find(t => t.id === option.id);
            if (existingOption) return;

            // 將新選項添加到 Option_Types 中
            product.Option_Types.push({
                id: option.id,
                name: option.name
            });
        },

        showNotification(message, type) {
            this.notification.message = message;
            this.notification.type = type;
            this.notification.visible = true;
            setTimeout(() => {
                this.notification.visible = false;
            }, 5000);
        }
    },
    mounted() {
        this.fetchMenu();
        this.fetchOption();
    }
}
</script>

<style scoped>
h1 {
    text-align: center;
}

h3 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
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
.notification.success {
    background-color: #4caf50;
}
.notification.error {
    background-color: #f44336;
}

.category-block {
    width: 90%; /* 佔父容器的90% */
    max-width: 350px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    border: 2px solid #000;
    padding: 10px;
    border-radius: 10px;
}

.category-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.item-card {
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.item-name-input {
    width: 90%; /* 佔父容器的90% */
    max-width: 315px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    padding: 8px;
    font-size: 14px;
    height: auto;
}

.editable-input {
    width: 90%; /* 佔父容器的90% */
    max-width: 315px; /* 最大寬度為300px */
    margin: 10px auto; /* 垂直居中 */
    padding: 8px;
    font-size: 14px;
    height: 150px;
}

.select-input {
    width: 90%;
    max-width: 315px;
    padding: 8px;
    margin: 10px auto;
    font-size: 14px;
    display: block;
}

.options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.option-box {
    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    background-color: #e8e8e8;
    border-radius: 5px;
}

.remove-icon {
    margin-right: 5px;
    color: #d9534f;
    cursor: pointer;
}

.add-option {
    cursor: pointer;
    color: #5cb85c;
    font-weight: bold;
    margin-top: 10px;
}

.item-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}

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

.label {
    display: block;
    margin-bottom: 4px;
}

.option-list {
  margin-top: 5px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
}

.option-item {
  padding: 5px;
  cursor: pointer;
}

.option-item:hover {
  background-color: #eee;
}
</style>