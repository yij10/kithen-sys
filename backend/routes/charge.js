const express = require('express');
const router = express.Router();
const {Order, Order_Product, Product, Option, Coupon, Option_Type, User} = require('../models');
const auth = require('../middlewares/auth');
const checkAdmin = require('../middlewares/checkAdmin');

async function get_orders(req, res) {
    try {
        const orders = await Order.findAll({
            include:
            [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: User,
                    as: 'handler',
                    attributes: ['id', 'name', 'email',]
                },
                {
                    model: Order_Product,
                    include:
                    [
                        {
                            model: Product,
                            attributes: ['name', 'price', 'available'],
                        },
                        {
                            model: Option,
                            attributes: ['name', 'price'],
                            through: {attributes: []},
                            include:
                            [{
                                model: Option_Type,
                                attributes:['name'],
                            }]
                        }, 
                    ],
                    attributes: ['id', 'serve_state', 'createdAt'],
                },
                {
                    model: Coupon,
                    attributes: ['name', 'type', 'percent_off', 'discount'],
                    through: {attributes: []},
                }
            ],
            attributes: ['id', 'serve_state', 'paid_state', 'price'],
        });

        console.log(JSON.stringify(orders, null, 2));
        return res.json(orders);

    } catch (error) {
        console.error('Error fetching orders: ', error);
        res.status(500).json({ error: 'Failed to fetch orders' });

    }
}

async function confirm_charge(req, res)
{
    console.log('confirm charge body: ', req.body);
    const rec = req.body;
    try {
        const order = await Order.findByPk(rec.order_id);
        if(!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.paid_state = rec.paid_state;
        order.handler_id = rec.user_id;
        await order.save();

        res.status(200).json(order);
    }
    catch (error) {
        console.error('Error confirming charge: ', error);
        res.status(500).json({ error: 'Failed to confirm charge' });
    }
}

router.get('/', get_orders);
router.post('/confirm-charge', auth, checkAdmin, confirm_charge);

module.exports = router;