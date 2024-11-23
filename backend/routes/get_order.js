const express = require('express');
const router = express.Router();
const {Order, Product, Option_Type, Option, Order_Product} = require('../models');
const { where } = require('sequelize');
const auth = require('../middlewares/auth');
const checkAdmin = require('../middlewares/checkAdmin');


async function get_order_item_name(req, res)
{
    console.log('req body: ', req.body);
    const selectedStates = req.body;
    // 轉成字串陣列，並把狀態true的過濾出來
    const statesArray = Object.keys(selectedStates).filter(state => selectedStates[state])
                        .map(state => (state === 'waiting' ? 'waiting for delivery' : state));
    try
    {
        // 不是每個order都會選degree，所以分開request後再合起來
        const orders = await Order_Product.findAll({
            include: 
            [
                {
                    model: Product,
                    attributes: ['name', 'available'],
                },
                {
                    model: Order,
                    attributes: ['table_id', 'user_id', 'serve_state', 'paid_state'],
                    // where: {paid_state: false}
                },
                {
                    model: Option,
                    attributes: ['name'],
                    through: {attributes: []},
                    include:
                    [{
                      model: Option_Type,
                      attributes:['name'],
                    }]
                },
                // {
                //   model: Option,
                //   attributes: ['name'],
                //   through:{attributes: []},
                // }
            ],
            attributes: ['id', 'serve_state', 'createdAt'],
            where: {
                serve_state: statesArray,
            },
        });


        //客製化的部分
        // const orders_degrees = await Promise.all(
        //     orders.map(async(order) =>{
        //         const degrees = await OrderChoice.findAll({
        //             include:
        //             [
        //                 {
        //                     model: Choice,
        //                     attributes: ['choice_name'],
        //                 },
        //                 {
        //                     model: Degree,
        //                     attributes: ['degree_name'],
        //                 }
        //             ],
        //             attributes: ['choice_id'],
        //             where: {order_id: order.order_id},
        //         });
        //         return {...order.get(), degrees};
        //     })
        // );

        // console.log(orders_degrees);
        console.log(JSON.stringify(orders, null, 2));

        return res.json(orders);
    }
    catch (error)
    {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
}

async function modify_state(req, res)
{
    console.log('req params: ', req.params);
    console.log('req body: ', req.body);
    const {id} = req.params;
    const {state} = req.body;

    try
    {
        const order = await Order_Product.findByPk(id);
        if(!order)
        {
            return res.status(404).json({ error: 'Order not found' });
        }
        console.log('order be modified: ', id);
        order.serve_state = state;
        await order.save();

        res.status(200).json(order);
    }
    catch (error)
    {
        console.error('Error updating order state:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function delete_order(req, res) {
  console.log('req params: ', req.params);
  const { id } = req.params;

  try {
      const order = await Order_Product.findByPk(id);
      if (!order) {
          return res.status(404).json({ error: 'Order not found' });
      }

      await order.destroy();
      console.log('Order deleted: ', id);

      res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
  }
}

router.post('/', get_order_item_name);

router.patch('/:id', auth, checkAdmin, modify_state);

router.delete('/:id', auth, checkAdmin, delete_order)

module.exports = router;