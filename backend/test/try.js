const { Order, Item } = require('../models'); // 確保模型已正確載入

async function getOrderDetails() {
  try {
    const result = await Order.findAll({
      include: [{
        model: Item,
        attributes: ['item_id', 'item_name'], // 指定需要的 Order 欄位
      }],
      attributes: ['table_id', 'state', 'order_time'], // 指定需要的 Item 欄位
      required: true, // 確保只有符合條件的項目會被返回（相當於 INNER JOIN）
    });

    console.log(JSON.stringify(result, null, 2)); // 以更易讀的方式顯示結果
    return result; // 返回結果
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
}

// 調用函數進行測試
getOrderDetails();
