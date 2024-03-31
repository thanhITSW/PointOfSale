function validator(fullname, email, phone) {
    if (fullname.length < 3) {
        return 'Full name must be at least 3 characters'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email'
    }

    if (phone.length < 3) {
        return 'Phone must be at least 6 characters'
    }

    return ''
  };

module.exports = validator;