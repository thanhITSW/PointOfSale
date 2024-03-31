const Customer = require('../models/Customer')
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const DetailsOrder = require('../models/DetailsOrder')
const Product = require('../models/Product')

module.exports.add_order = (req, res) => {
    
    const {customerPhone, totalQuantity, totalPrice, customerName, customerAddress, received, refunds} = req.body
    const name = customerName
    const phone = customerPhone
    const address = customerAddress
    const employeeName = req.session.user.fullname
    let creation_date = new Date();
    creation_date = formatDateString(creation_date.toLocaleDateString());

    Customer.findOne({phone: phone}).then(customer => {
        if(!customer) {
            let newCustomer = new Customer({
                name, phone, address
            })
            newCustomer.save()
        }
    })
    .catch(e => {
        console.log('Search customer failed')
    });

    //order
    let order = new Order({
        employeeName, customerPhone, customerName, customerAddress, totalQuantity, totalPrice, received, refunds, creation_date
    })
    order.save()
        .then(() => {
            const orderId = order._id

            Cart.find({ employeeName })
            .then(carts => {
                if(carts.length === 0) {
                    return res.json({ code: 0, message: 'Payment success' })
                }

                let detailsOrder = undefined
                let productBarcode = undefined
                let productName = undefined
                let price = undefined
                let quantity = undefined
                let totalPrice_ = undefined

                const savePromises = []

                carts.forEach(cart => {
                    productBarcode = cart.productBarcode
                    productName = cart.productName
                    price = cart.price
                    quantity = cart.quantity
                    totalPrice_ = cart.totalPrice

                    const promise = new Promise((resolve, reject) => {

                        detailsOrder = new DetailsOrder({
                            orderId, productBarcode, productName, price, quantity, totalPrice: totalPrice_
                        })
                
                        detailsOrder.save()
                            .then(() => {
                                resolve();
                            })
                            .catch(e => {
                                reject(e);
                            });
                    });

                    savePromises.push(promise);
                })

                Promise.all(savePromises)
                    .then(() => {

                        //delete cart
                        Cart.deleteMany({ employeeName: employeeName })
                            .then(result => {
                                req.session.user.recentOrder = order
                                return res.json({ code: 0, message: 'Payment success' });
                            })
                            .catch(e => {
                                return res.json({ code: 2, message: 'Clean cart failed' });
                            });
                    })
                    .catch(e => {
                        return res.json({ code: 2, message: 'Create all details order failed'});
                    });
            })
            .catch(e => {
                return res.json({ code: 2, message: 'Find cart failed' })
            })
        })
        .catch(e => {
            return res.json({ code: 2, message: 'Create order failed' })
        })
}

module.exports.history_customer = (req, res) => {
    const {customerPhone, receivedInput} = req.body

    Order.find({ customerPhone })
    .then(orders => {

        const totalOrder = orders.length
        let totalQuantity = 0
        let totalPayment = 0
        let totalReceived = 0
        let totalRefunds = 0

        orders.forEach(order => {
            totalQuantity += order.totalQuantity
            totalPayment += order.totalPrice
            totalReceived += order.received
            totalRefunds += order.refunds
        })

        req.session.customerPhone = customerPhone
        req.session.received = receivedInput
        return res.render('HistoryCustomer', {listOrders: orders, totalOrder, totalQuantity, totalPayment, totalReceived, totalRefunds})
    })
}

module.exports.report = async (req, res) => {

    let {timeRange, startDate, endDate, sortBy} = req.body

    let dateCondition = {};

    let fromDate = new Date()
    let toDate = new Date()
    
    if(timeRange) {

        if(timeRange === 'custom') {
            if(startDate && endDate) {
                fromDate = new Date(startDate);
                toDate = new Date(endDate);
                fromDate = formatDateString(fromDate.toLocaleDateString());
                toDate = formatDateString(toDate.toLocaleDateString());
                dateCondition = { creation_date: { $gte: fromDate, $lte: toDate } };
            }
        }
        else {
            if(timeRange !== 'all') {
                if(timeRange === 'today') {
                    fromDate.setDate(fromDate.getDate() - 0);
                    toDate.setDate(fromDate.getDate() - 0);
                }
                else if(timeRange === 'yesterday') {
                    fromDate.setDate(fromDate.getDate() - 1);
                    toDate.setDate(toDate.getDate() -1);
                }
                else if(timeRange === '7days') {
                    fromDate.setDate(fromDate.getDate() - 7);
                }
                else if(timeRange === '30days') {
                    fromDate.setDate(fromDate.getDate() - 30);
                }
                fromDate = formatDateString(fromDate.toLocaleDateString());
                toDate = formatDateString(toDate.toLocaleDateString());
                dateCondition = { creation_date: { $gte: fromDate, $lte: toDate } };
            }
        }
    }

    let totalOrder = 0
    let totalQuantity = 0
    let totalPayment = 0
    let totalReceived = 0
    let totalRefunds = 0
    let capital = 0

    let sortCondition = {}

    if(sortBy) {
        if(sortBy === 'creation_date') {
            sortCondition = { creation_date: 1 }
        }
        else if(sortBy === 'totalQuantity') {
            sortCondition = { totalQuantity: 1 }
        }
        else if(sortBy === 'totalPrice') {
            sortCondition = { totalPrice: 1 }
        }
    }

    const orders = await Order.find(dateCondition).sort(sortCondition);

    totalOrder = orders.length

    const detailsPromises = orders.map(order => {

        totalQuantity += order.totalQuantity
        totalPayment += order.totalPrice
        totalReceived += order.received
        totalRefunds += order.refunds

        return DetailsOrder.find({ orderId: order._id }).then(details => {
            return Promise.all(
                details.map(detail => {
                    return Product.findOne({ barcode: detail.productBarcode }).then(product => {
                        capital = capital + detail.quantity * product.import_price;
                    });
                })
            );
        });
    });

    await Promise.all(detailsPromises);

    const proceeds = totalPayment
    const profit = proceeds - capital
    return res.render('ReportOrder', {role: req.session.user.role ,listOrders: orders, totalOrder, totalQuantity, totalPayment, 
        totalReceived, totalRefunds, timeRange, startDate, endDate, sortBy, proceeds, capital, profit})
}

module.exports.details = (req, res) => {
    const {orderId} = req.body

    DetailsOrder.find({ orderId })
    .then(details => {
        return res.json({code: 0, data: details})
    })
    .catch(e => {
        return res.json({code: 2, message: 'View details order failed'})
    })
}

function formatDateString(inputDateString) {
    let dateObject = new Date(inputDateString);

    let day = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    let year = dateObject.getFullYear();

    //"MM/DD/YYYY"
    let formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return formattedDate;
}