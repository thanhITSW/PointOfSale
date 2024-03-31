const Product = require('../models/Product')
const DetailsOrder = require('../models/DetailsOrder')
const multer = require('multer')
const fs = require('fs');
const path = require('path');

const upload = multer({
    dest: path.join(__dirname, '..', 'public', 'Image', 'products'),
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true)
        }
        else callback(null, false)
    }, limits: { fileSize: 500000 }
}) // 500kb max

module.exports.display_products = (req, res) => {

    const errorMessage = req.flash('errorMessage') || ''

    Product.find().select('-import_price').sort('barcode')
        .then(listItems => {
            res.render('Home', { listItems, errorMessage })
        })

}

module.exports.search_products = (req, res) => {

    let {keyword} = req.body
    
    if(!keyword) {
        keyword = ''
    }

    Product.find({
        $or: [
          { barcode: { $regex: keyword, $options: 'i' } },
          { name: { $regex: keyword, $options: 'i' } }
        ]
      }).select('-import_price')
        .then(listItems => {
            return res.json({code: 0, data: listItems})
        })
        .catch(e => {
            return res.json({code: 2, message: 'Get products failed'}) 
        })

}

module.exports.get_all_products = (req, res) => {

    if(req.session.user.role !== 'admin') {
        Product.find()
        .then(listItems => {
            return res.render('OnlyDisplayProduct', { listItems})
        })
    }
    else {
        const errorMessage = req.flash('errorMessage') || ''
        const successMessage = req.flash('successMessage') || ''
    
        Product.find().sort('barcode')
            .then(listItems => {
                res.render('ManageProduct', { listItems, errorMessage, successMessage })
            })
    }
}

module.exports.add_product = (req, res) => {

    let uploader = upload.single('image')
    uploader(req, res, err => {
        const { barcode, name, import_price, retail_price, category } = req.body

        let creation_date = new Date();
        creation_date = formatDateString(creation_date.toLocaleDateString());
        let url_image = undefined
        let oldImagePath = undefined
        let newImageName = undefined
        let newImagePath = undefined

        let image = req.file

        if (!image) {
            const defaultName = 'default.png'

            oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'products', defaultName);
            newImageName = name.trim().replace(/\s+/g, '') + path.extname(defaultName);
        }
        else {
            oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'products', image.filename);
            newImageName = name.trim().replace(/\s+/g, '') + path.extname(image.originalname);
        }

        newImagePath = path.join(__dirname, '..', 'public', 'Image', 'products', newImageName);

        url_image = newImageName;

        let product = new Product({
            barcode, name, import_price, retail_price, category, creation_date, url_image
        })

        product.save()
            .then(() => {
                if(!image) {
                    fs.copyFileSync(oldImagePath, newImagePath)
                }
                else {
                    fs.renameSync(oldImagePath, newImagePath);
                }

                req.flash('successMessage', 'Add product success')
                res.redirect('/products');
            })
            .catch(e => {
                if (image) {
                    const imagePath = path.join(__dirname, '..', 'public', 'Image', 'products', image.filename);
                    fs.unlinkSync(imagePath)
                }

                if (e.message.includes('barcode')) {
                    req.flash('errorMessage', 'Barcode already exists')
                }
                else if (e.message.includes('name')) {
                    req.flash('errorMessage', 'Name already exists')
                }
                else {
                    req.flash('errorMessage', 'Add failed, an error has occurred')
                }
                res.redirect('/products')
            })
    })
}

module.exports.edit_product = (req, res) => {

    let uploader = upload.single('image')
    uploader(req, res, err => {
        const { id, barcode, name, import_price, retail_price, category, url_image: old_url_image } = req.body

        let creation_date = new Date();
        creation_date = formatDateString(creation_date.toLocaleDateString());
        let url_image = undefined
        let oldNamePath = undefined
        let newNamePath = undefined
        let oldImagePath = undefined
        let newImagePath = undefined
        let newImageName = undefined

        let image = req.file

        oldNamePath = path.join(__dirname, '..', 'public', 'Image', 'products', old_url_image);
        newImageName = name.trim().replace(/\s+/g, '') + path.extname(old_url_image);
        newNamePath = path.join(__dirname, '..', 'public', 'Image', 'products', newImageName);

        if(image) {
            oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'products', image.filename);
            newImageName = name.trim().replace(/\s+/g, '') + path.extname(image.originalname);
            newImagePath = path.join(__dirname, '..', 'public', 'Image', 'products', newImageName);
        }

        url_image = newImageName;

        const dataUpdate = {
            barcode, name, import_price, retail_price, category, creation_date, url_image
        }

        Product.findByIdAndUpdate(id, dataUpdate, {
            new: true
        })
            .then(p => {
                if (!p) {
                    req.flash('errorMessage', 'Id not found: ' + id)
                }
                else {
                    fs.renameSync(oldNamePath, newNamePath);
                    if(image) {
                        fs.renameSync(oldImagePath, newImagePath);
                    }
                    req.flash('successMessage', 'Edit product success')
                }
                res.redirect('/products')
            })
            .catch(e => {
                if (image) {
                    const imagePath = path.join(__dirname, '..', 'public', 'Image', 'products', image.filename);
                    fs.unlinkSync(imagePath)
                }

                if (e.message.includes('Cast to ObjectId failed')) {
                    req.flash('errorMessage', 'Invalid Id')
                }
                else if (e.message.includes('barcode')) {
                    req.flash('errorMessage', 'Barcode already exists')
                }
                else if (e.message.includes('name')) {
                    req.flash('errorMessage', 'Name already exists')
                }
                else {
                    req.flash('errorMessage', 'Edit failed, An error has occurred: ' + e.message)
                }
                res.redirect('/products')
            })
    })
}

module.exports.delete_product = (req, res) => {
    const { id } = req.body

    if (!id) {
        req.flash('errorMessage', 'Please provide id product')
        res.redirect('/products')
    }

    Product.findById(id)
    .then(p => {
        if (!p) {
            req.flash('errorMessage', 'Id not found: ' + id)
            res.redirect('/products');
        }
        else {
            DetailsOrder.findOne({productBarcode: p.barcode})
            .then(detail => {
                if(detail) {
                    req.flash('errorMessage', 'Product is in the order')
                    res.redirect('/products');
                }
                else {
                    Product.findByIdAndDelete(id)
                    .then(p => {
                        if (!p) {
                            req.flash('errorMessage', 'Id not found: ' + id)
                        }
                        else {
                            const { url_image } = p
                            const imagePath = path.join(__dirname, '..', 'public', 'Image', 'products', url_image);
                            fs.unlinkSync(imagePath)
                            req.flash('successMessage', 'Delete product success')
                        }
                        res.redirect('/products');
                    })
                    .catch(e => {
                        req.flash('errorMessage', 'Delete failed, An error has occurred')
                        res.redirect('/products')
                    })
                }
            })
            .catch(e => {
                req.flash('errorMessage', 'Delete failed, An error has occurred')
                res.redirect('/products')
            })
        }
    })
    .catch(e => {
        if (e.message.includes('Cast to ObjectId failed')) {
            req.flash('errorMessage', 'Invalid Id')
        }
        else {
            req.flash('errorMessage', 'Delete failed, An error has occurred')
        }
        res.redirect('/products')
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