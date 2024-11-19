const express = require('express');
const router = express.Router();
const {Order, Product, Option_Type, Option, Table_Num} = require('../models');
const { where } = require('sequelize');


async function get_order_item_name(req, res)
{
    console.log('req body: ', req.body);
    const selectedStates = req.body;
    // 轉成字串陣列，並把狀態true的過濾出來
    const statesArray = Object.keys(selectedStates).filter(state => selectedStates[state]);
    try
    {
        // 不是每個order都會選degree，所以分開request後再合起來
        const orders = await Order.findAll({
            include: 
            [
                {
                    model: Product,
                    attributes: ['name', 'available'],
                },
                {
                    model: Table_Num,
                    attributes: ['paid', 'handler_id'],
                },
                {
                    model: Option,
                    attributes: ['name'],
                    through: {attributes: []},
                    include:
                    {
                        model: Option_Type,
                        attributes: ['name'],
                    },
                }
            ],
            attributes: ['order_id', 'table_num_id', 'serve_state', 'order_time'],
            where: {serve_state: statesArray},
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
        const order = await Order.findByPk(id);
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

router.post('/', get_order_item_name);

router.patch('/:id', modify_state);

module.exports = router;