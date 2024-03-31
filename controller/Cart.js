const Product = require('../models/Product')
const Cart = require('../models/Cart')

module.exports.add_cart = (req, res) => {

    const { value, type } = req.body

    let searchCondition = {
        $or: [
            { barcode: { $regex: new RegExp(`^${value}$`, 'i') } },
            { name: { $regex: new RegExp(`^${value}$`, 'i') } },
        ]
    };

    if (type === '_id') {
        searchCondition = {
            $or: [
                { _id: value }
            ]
        };
    }

    const employeeName = req.session.user.fullname

    Product.findOne(searchCondition).then(product => {
        if (product) {

            const productBarcode = product.barcode
            const productName = product.name
            const price = product.retail_price
            const url_image = product.url_image
            let quantity = 1
            let totalPrice = price

            Cart.findOne({
                employeeName: employeeName,
                productBarcode: productBarcode
            })
                .then(cart => {
                    if (cart) {
                        quantity = cart.quantity + 1
                        totalPrice = quantity * price

                        cart.quantity = quantity
                        cart.totalPrice = totalPrice

                        cart.save()
                            .then(() => {
                                return res.json({ code: 0, message: 'Added to cart' });
                            })
                            .catch(e => {
                                return res.json({ code: 2, message: 'Add to cart failed' });
                            })

                    }
                    else {
                        let newCart = new Cart({
                            employeeName, productBarcode, productName, price, quantity, totalPrice, url_image
                        })
    
                        newCart.save()
                            .then(() => {
                                return res.json({ code: 0, message: 'Added to cart' });
                            })
                            .catch(e => {
                                return res.json({ code: 2, message: 'Add to cart failed' });
                            })
                    }
                })
                .catch(error => {
                    return res.json({ code: 2, message: error.message });
                });

        } else {
            return res.json({ code: 2, message: 'Product not found' });
        }
    })
        .catch(e => {
            return res.json({ code: 2, message: e.message });
        });

}

module.exports.get_cart = (req, res) => {
    const employeeName = req.session.user.fullname

    Cart.find({ employeeName })
    .then(carts => {
        res.render('Cart', {listCarts: carts, employeeName})
    })

}

module.exports.delete_cart = (req, res) => {
    const employeeName = req.session.user.fullname

    const {barcode} = req.body

    Cart.findOneAndDelete({
        $and: [
            { employeeName: employeeName },
            { productBarcode: barcode }
        ]
    })
    .then(cart => {
        if (!cart) {
            return res.json({code: 2, message: 'Cart not found'})
        } else {
            return res.json({code: 0, message: 'Remove success'})
        }
    })
    .catch(error => {
        return res.json({code: 2, message: error.message})
    });

}

module.exports.display_payment = (req, res) => {

    const employeeName = req.session.user.fullname
    const customerPhone = req.session.customerPhone || ''
    const received = req.session.received || ''
    delete req.session.customerPhone
    delete req.session.received

    Cart.find({ employeeName })
    .then(carts => {
        let totalQuantity = 0
        let totalPrice = 0
        carts.forEach(cart => {
            totalQuantity += cart.quantity
            totalPrice += cart.totalPrice
        })

        res.render('CheckOut', {listCarts: carts, employeeName, totalQuantity, totalPrice, customerPhone, received})
    })
}