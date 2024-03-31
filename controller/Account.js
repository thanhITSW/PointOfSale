const Account = require('../models/Account')
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt')

const validator = require('../validators/Account')
const createToken = require('../auth/createToken_sendEmail')

module.exports.login_UI = (req, res) => {

    if(req.session.user) {
        return res.redirect('/')
    }

    const errorMessage = req.flash('errorMessage') || ''
    let username = req.flash('username') || ''
    let password = req.flash('username') || ''
    let token = req.flash('token') || ''
    const {token: queryToken, username: queryUsername} = req.query
    if(queryToken) {
        token = queryToken
    }
    if(queryUsername) {
        username = queryUsername
        password = queryUsername
    }

    res.render('Login', { errorMessage, username, password, token })
}

module.exports.logout = (req, res) => {
    req.session.destroy()

    res.redirect('/')
}

module.exports.login_Submit = (req, res) => {

    // console.log(req.body)
    // console.log(req.session)
    let { username, password, token } = req.body
    let account = undefined

    req.flash('username', username)
    req.flash('password', password)
    req.flash('token', token)

    Account.findOne({ username: username })
        .then(acc => {
            if (!acc) {
                req.flash('errorMessage', 'Username does not exist')
                return res.redirect('/accounts/login')
            }
            account = acc
            return bcrypt.compare(password, acc.password)
        })
        .then(passwordMatch => {
            if (!passwordMatch) {
                req.flash('errorMessage', 'Incorrect password')
                return res.redirect('/accounts/login')
            }

            if(account.role == 'employee') {
                if(account.isActive === false) {
                    if(!req.session.verify) {
                        req.flash('errorMessage', req.session.messageVerifyToken)
                        delete req.session.verify
                        delete req.session.messageVerifyToken

                        return res.redirect('/accounts/login')
                    }
                }

                if(account.status === 'lock') {
                    req.flash('errorMessage', 'Your account has been locked')
                    return res.redirect('/accounts/login')
                }

                //set active for account
                account.isActive = true
                account.save()
            }

            req.session.user =  account
            return res.redirect('/');
        })
        .catch(e => {
            if(account) {
                req.flash('errorMessage', 'Login failed')
                return res.redirect('/accounts/login')
            }
        })
}

module.exports.list_employess = (req, res) => {

    if(req.session.user.role !== 'admin') {
        req.flash('errorMessage', 'Only admin is allowed')
        return res.redirect('/')
    }

    Account.find({ role: { $ne: 'admin' } })
        .then(listEmployees => {
            res.render('ListEmployees', { listEmployees})
        })
}

module.exports.get_all_employees = (req, res) => {

    if(req.session.user.role !== 'admin') {
        req.flash('errorMessage', 'Only admin is allowed')
        return res.redirect('/')
    }

    const errorMessage = req.flash('errorMessage') || ''
    const successMessage = req.flash('successMessage') || ''

    Account.find({ role: { $ne: 'admin' } })
        .then(listEmployees => {
            res.render('ManageAccount', { listEmployees, errorMessage, successMessage })
        })
}

module.exports.add_employee = (req, res) => {

    const { fullname, email, phone } = req.body
    let image = req.file

    const error = validator(fullname, email, phone)
    if (error !== '') {
        if (image) {
            const imagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
            fs.unlinkSync(imagePath)
        }

        req.flash('errorMessage', error)
        return res.redirect('/accounts')
    }

    const username = email.split('@')[0];
    const password = username
    const role = 'employee'
    const isActive = false
    const status = 'unlock'
    const isFirst = true

    let url_avatar = undefined
    let oldImagePath = undefined
    let newImageName = undefined
    let newImagePath = undefined

    if (!image) {
        const defaultName = 'default.png'

        oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', defaultName);
        newImageName = username.trim().replace(/\s+/g, '') + path.extname(defaultName);
    }
    else {
        oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
        newImageName = username.trim().replace(/\s+/g, '') + path.extname(image.originalname);
    }

    newImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', newImageName);

    url_avatar = newImageName;

    const hashed = bcrypt.hashSync(password, 5)

    let account = new Account({
        fullname, email, username, password: hashed, phone, role, isActive, status, url_avatar, isFirst
    })

    account.save()
        .then(() => {
            if(!image) {
                fs.copyFileSync(oldImagePath, newImagePath)
            }
            else {
                fs.renameSync(oldImagePath, newImagePath);
            }

            createToken(account.fullname, account.email, account.username, account.phone)

            req.flash('successMessage', 'Add employee success')
            res.redirect('/accounts');
        })
        .catch(e => {
            if (image) {
                const imagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
                fs.unlinkSync(imagePath)
            }

            if (e.message.includes('fullname')) {
                req.flash('errorMessage', 'Full name already exists')
            }
            else if (e.message.includes('email')) {
                req.flash('errorMessage', 'Email already exists')
            }
            else if (e.message.includes('username')) {
                req.flash('errorMessage', 'User name already exists')
            }
            else {
                req.flash('errorMessage', 'Add failed, an error has occurred')
            }
            res.redirect('/accounts')
        })
}

module.exports.edit_employee = (req, res) => {

    const { id, fullname, email, phone, url_avatar: old_url_avatar } = req.body
    const username = email.split('@')[0];
    let image = req.file

    const error = validator(fullname, email, phone)
    if (error !== '') {
        if (image) {
            const imagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
            fs.unlinkSync(imagePath)
        }

        req.flash('errorMessage', error)
        return res.redirect('/accounts')
    }

    let url_avatar = undefined
    let oldNamePath = undefined
    let newNamePath = undefined
    let oldImagePath = undefined
    let newImagePath = undefined
    let newImageName = undefined

    oldNamePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', old_url_avatar);
    newImageName = username.trim().replace(/\s+/g, '') + path.extname(old_url_avatar);
    newNamePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', newImageName);
    if (image) {
        oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
        newImageName = username.trim().replace(/\s+/g, '') + path.extname(image.originalname);
        newImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', newImageName);
    }

    url_avatar = newImageName;

    let dataUpdate = {
        fullname, email, username, phone, url_avatar
    }
    let supportedFields = ['fullname', 'email', 'username', 'phone', 'url_avatar']

    for (field in dataUpdate) {
        if (!supportedFields.includes(field)) {
            delete dataUpdate[field]
        }
    }

    Account.findByIdAndUpdate(id, dataUpdate, {
        new: true
    })
        .then(a => {
            if (!a) {
                req.flash('errorMessage', 'Id not found: ' + id)
            }
            else {
                fs.renameSync(oldNamePath, newNamePath);
                if (image) {
                    fs.renameSync(oldImagePath, newImagePath);
                }
                req.flash('successMessage', 'Edit employee success')
            }
            res.redirect('/accounts')
        })
        .catch(e => {
            if (image) {
                const imagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
                fs.unlinkSync(imagePath)
            }

            if (e.message.includes('Cast to ObjectId failed')) {
                req.flash('errorMessage', 'Invalid Id')
            }
            else if (e.message.includes('fullname')) {
                req.flash('errorMessage', 'Full name already exists')
            }
            else if (e.message.includes('email')) {
                req.flash('errorMessage', 'Email already exists')
            }
            else if (e.message.includes('username')) {
                req.flash('errorMessage', 'User name already exists')
            }
            else {
                req.flash('errorMessage', 'Edit failed, an error has occurred')
            }
            res.redirect('/accounts')
        })
}

module.exports.delete_employee = (req, res) => {

    const { id } = req.body

    if (!id) {
        req.flash('errorMessage', 'Please provide id employee')
        res.redirect('/accounts')
    }

    Account.findByIdAndDelete(id)
        .then(a => {
            if (!a) {
                req.flash('errorMessage', 'Id not found: ' + id)
            }
            else {
                const { url_avatar } = a
                const avatarPath = path.join(__dirname, '..', 'public', 'Image', 'avatars', url_avatar);
                fs.unlinkSync(avatarPath)
                req.flash('successMessage', 'Delete employee success')
            }
            res.redirect('/accounts');
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                req.flash('errorMessage', 'Invalid Id')
            }
            else {
                req.flash('errorMessage', 'Delete failed, An error has occurred' + e.message)
            }
            res.redirect('/accounts')
        })
}

module.exports.delete_many_employee = async (req, res) => {

    const { selectedIds } = req.body
    const idsArray = selectedIds.split(',');

    if (idsArray[0] === '') return res.json({ code: 1, message: 'No employee selected' })

    await idsArray.forEach((id) => {
        Account.findByIdAndDelete(id)
            .then(a => {
                if (!a) {
                    return res.json({ code: 2, message: 'Id not found: ' + id })
                }
                else {
                    const { url_avatar } = a
                    const avatarPath = path.join(__dirname, '..', 'public', 'Image', 'avatars', url_avatar);
                    fs.unlinkSync(avatarPath)
                }
            })
            .catch(e => {
                if (e.message.includes('Cast to ObjectId failed')) {
                    return res.json({ code: 2, message: 'Invalid Id' })
                }
                return res.json({ code: 2, message: 'Delete failed, An error has occurred: ' + e.message })
            })
    });

    return res.json({ code: 0, message: `Delete success: ${idsArray.length}` })

}

module.exports.lock_and_unlock_employee = async (req, res) => {

    const { selectedIds, status } = req.body
    const idsArray = selectedIds.split(',');

    if (idsArray[0] === '') return res.json({ code: 1, message: 'No employee selected' })

    let dataUpdate = {
        status
    }

    await idsArray.forEach((id) => {
        Account.findByIdAndUpdate(id, dataUpdate, {
            new: true
        })
            .then(a => {
                if (!a) {
                    return res.json({ code: 2, message: 'Id not found: ' + id })
                }
            })
            .catch(e => {
                if (e.message.includes('Cast to ObjectId failed')) {
                    return res.json({ code: 2, message: 'Invalid Id' })
                }
                return res.json({ code: 2, message: 'Lock failed, An error has occurred: ' + e.message })
            })
    });

    return res.json({ code: 0, message: `${status} success: ${idsArray.length}` })
}

module.exports.resend_email = async (req, res) => {

    const { selectedIds } = req.body
    const idsArray = selectedIds.split(',');

    if (idsArray[0] === '') return res.json({ code: 1, message: 'No employee selected' })

    await idsArray.forEach((id, index) => {
        Account.findById(id)
        .then(a => {
            if(!a) {
                return res.json({code: 2, message: 'Id not found: ' + id})
            }

            createToken(a.fullname, a.email, a.username, a.phone)
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                return res.json({ code: 2, message: 'Invalid Id' })
            }
            return res.json({ code: 2, message: 'Resend email failed, An error has occurred: ' + e.message })
        })
    });

    return res.json({ code: 0, message: `Resend email success: ${idsArray.length}` })
}

module.exports.change_password = (req, res) => {

    const { id, password } = req.body

    if (!id) {
        req.flash('errorMessage', 'Please provide id employee')
        res.redirect('/information')
    }

    const hashed = bcrypt.hashSync(password, 5)

    let dataUpdate = {
        password: hashed
    }

    Account.findByIdAndUpdate(id, dataUpdate, {
        new: true
    })
        .then(a => {
            if (!a) {
                req.flash('errorMessage', 'Id not found: ' + id)
            }
            else {
                req.flash('successMessage', 'Change password success')
            }
            req.session.user = a
            res.redirect('/information');
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                req.flash('errorMessage', 'Invalid Id')
            }
            else {
                req.flash('errorMessage', 'Change password failed, An error has occurred' + e.message)
            }
            res.redirect('/information')
        })
}

module.exports.update_information = (req, res) => {

    const { id, fullname, email, phone, url_avatar: old_url_avatar } = req.body
    const username = email.split('@')[0];
    let image = req.file

    const error = validator(fullname, email, phone)
    if (error !== '') {
        if (image) {
            const imagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
            fs.unlinkSync(imagePath)
        }

        req.flash('errorMessage', error)
        return res.redirect('/information')
    }

    let url_avatar = undefined
    let oldNamePath = undefined
    let newNamePath = undefined
    let oldImagePath = undefined
    let newImagePath = undefined
    let newImageName = undefined

    oldNamePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', old_url_avatar);
    newImageName = username.trim().replace(/\s+/g, '') + path.extname(old_url_avatar);
    newNamePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', newImageName);
    if (image) {
        oldImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
        newImageName = username.trim().replace(/\s+/g, '') + path.extname(image.originalname);
        newImagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', newImageName);
    }

    url_avatar = newImageName;

    let dataUpdate = {
        fullname, email, username, phone, url_avatar
    }
    let supportedFields = ['fullname', 'email', 'username', 'phone', 'url_avatar']

    for (field in dataUpdate) {
        if (!supportedFields.includes(field)) {
            delete dataUpdate[field]
        }
    }

    Account.findByIdAndUpdate(id, dataUpdate, {
        new: true
    })
        .then(a => {
            if (!a) {
                req.flash('errorMessage', 'Id not found: ' + id)
            }
            else {
                fs.renameSync(oldNamePath, newNamePath);
                if (image) {
                    fs.renameSync(oldImagePath, newImagePath);
                }
                req.flash('successMessage', 'Update success')
            }
            req.session.user = a
            res.redirect('/information')
        })
        .catch(e => {
            if (image) {
                const imagePath = path.join(__dirname, '..', 'public', 'Image', 'avatars', image.filename);
                fs.unlinkSync(imagePath)
            }

            if (e.message.includes('Cast to ObjectId failed')) {
                req.flash('errorMessage', 'Invalid Id')
            }
            else if (e.message.includes('fullname')) {
                req.flash('errorMessage', 'Full name already exists')
            }
            else if (e.message.includes('email')) {
                req.flash('errorMessage', 'Email already exists')
            }
            else if (e.message.includes('username')) {
                req.flash('errorMessage', 'User name already exists')
            }
            else {
                req.flash('errorMessage', 'Update failed, an error has occurred')
            }
            res.redirect('/information')
        })
}

module.exports.change_password_first_login = (req, res) => {

    const { id, password } = req.body

    if (!id) {
        return res.json({code: 2, message: 'Please provide id employee'})
    }

    const hashed = bcrypt.hashSync(password, 5)
    const isFirst = false

    let dataUpdate = {
        password: hashed, isFirst
    }

    Account.findByIdAndUpdate(id, dataUpdate, {
        new: true
    })
        .then(a => {
            if (!a) {
                return res.json({code: 2, message: 'Id not found: ' + id})
            }

            req.session.user = a
            return res.json({code: 0, message: 'Change password success'})
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                return res.json({code: 2, message: 'Invalid Id'})
            }
            return res.json({code: 2, message: 'Change password failed, An error has occurred' + e.message})
        })
}