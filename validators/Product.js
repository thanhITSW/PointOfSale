const {check} = require('express-validator')

module.exports = [
    check('barcode')
    .exists().withMessage('Please provide barcode')
    .notEmpty().withMessage('Barcode cannot be epmty'),

    check('name')
    .exists().withMessage('Please provide product name')
    .notEmpty().withMessage('Product name cannot be epmty'),

    check('import_price')
    .exists().withMessage('Please provide import price')
    .notEmpty().withMessage('Import price name cannot be epmty')
    .isNumeric().withMessage('Import price must be a number'),

    check('retail_price')
    .exists().withMessage('Please provide retail price')
    .notEmpty().withMessage('Retail price name cannot be epmty')
    .isNumeric().withMessage('Retail price must be a number'),

    check('category')
    .exists().withMessage('Please provide category')
    .notEmpty().withMessage('Category cannot be epmty')
]