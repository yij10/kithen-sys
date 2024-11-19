const express = require('express');
const router = express.Router();
const{Product, Category, Option_Type, Product_Option_Type} = require('../models');
const auth = require('../middlewares/auth');
const checkAdmin = require('../middlewares/checkAdmin');

async function get_menu(req, res) {
    try {
        const menu = await Category.findAll({
            include: [
                {
                    model: Product,
                    include: [{
                        model: Option_Type,
                        attributes: ['id', 'name'],
                        through: {
                            model: Product_Option_Type,
                            where: { isDelete: false }  // 只包含 isDelete 為 false 的選項
                        }
                    }],
                    attributes: ['id', 'name', 'price', 'description', 'available'],
                }
            ],
            attributes: ['id', 'name'],
        });

        console.log(JSON.stringify(menu, null, 2));
        return res.json(menu);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
}

async function get_option(req, res)
{
    console.log('require option type');
    try {
        const option = await Option_Type.findAll({
            attributes: ['id', 'name'],
        });

        console.log(JSON.stringify(option, null, 2));
        return res.json(option);
    } catch (error) {
        console.error('Error fetcjing orders:', error);
        res.status(500).json({error: 'Failed to fetch orders'});
    }
}

async function update_menu(req, res) {
    const {id} = req.params;
    console.log('update menu ', id);
    item = req.body;
    console.log(item);

    try {
        const product = await Product.findByPk(item.id);
        if (!product) {
            console.log('Product not found');
            return res.status(404).json({ error: 'Product not found' });
        }

        product.name = item.name;
        product.price = item.price;
        product.description = item.description;
        product.available = item.available;
        await product.save();

        // 取得目前在資料庫中的 Option_Type 列表
        const currentOptionTypes = await Product_Option_Type.findAll({
            where: { product_id: item.id }
        });

        // 取得前端回傳的 Option_Type IDs
        const newOptionTypeIds = item.Option_Types.map(opt => opt.id);

        // 設置目前資料庫中需要更新的 option 的 isDelete 狀態
        for (const existingOption of currentOptionTypes) {
            if (newOptionTypeIds.includes(existingOption.option_type_id)) {
                // 如果在前端傳來的列表中，設置 isDelete 為 false
                await existingOption.update({ isDelete: false });
            } else {
                // 如果不在前端傳來的列表中，設置 isDelete 為 true
                await existingOption.update({ isDelete: true });
            }
        }

        // 新增前端傳來，但目前資料庫中不存在的 Option_Type
        for (const optionTypeId of newOptionTypeIds) {
            const existingOption = currentOptionTypes.find(opt => opt.option_type_id === optionTypeId);
            if (!existingOption) {
                // 新增不存在於資料庫的選項並設置 isDelete 為 false
                await Product_Option_Type.create({
                    product_id: productId,
                    option_type_id: optionTypeId,
                    isDelete: false,
                });
            }
        }
        
        const updatedProduct = await Product.findByPk(item.id, {
            include: {     
                model: Option_Type, 
                through: {
                    model: Product_Option_Type,
                    where: { isDelete: false }  // 只包含 isDelete 為 false 的選項
                }
            },
            attributes: ['id', 'name', 'price', 'description', 'available'],
        });
        console.log(JSON.stringify(updatedProduct, null, 2));
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
}

router.get('/show-menu', get_menu);
router.get('/get-all-options', auth, checkAdmin, get_option);
router.put('/update-item/:id', auth, checkAdmin, update_menu)

module.exports = router;