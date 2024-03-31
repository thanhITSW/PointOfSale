const Customer = require('../models/Customer')

module.exports.search = (req, res) => {
    const {phone} = req.body

    Customer.findOne({phone: phone}).then(customer => {
        if(customer) {
            return res.json({ code: 0, message: 'Found one customer', customerName: customer.name, customerAddress: customer.address });
        }
        else {
            return res.json({ code: 1, message: 'No customer' });
        }
    })
    .catch(e => {
        return res.json({ code: 2, message: 'Search customer failed' });
    });
}