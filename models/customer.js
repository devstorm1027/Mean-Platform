const mongoose = require("mongoose");
const imageSchema = require("./image");
const _promise = require('bluebird');
const bcrypt = require("bcryptjs");
const validator = require("validator");

const compare = _promise.promisify(bcrypt.compare);
const hash = _promise.promisify(bcrypt.hash);

const HASH_SALT_ROUNDS = 10;

const STATUS = {
    ACTIVE: "ACTIVE",
    HOLD: "HOLD",
    BLOCKED: "BLOCKED"
};

const customerSchema = new mongoose.Schema({

    //validators & field scheme will be added later
    //TODO: why it is needed to describe it after module.export?
    //TODO: when adding a single tag, for example - validator is fired few times. Why?

    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false,
        select: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: (email) => {
                return validator.isEmail(email);
            }
        }
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: [ STATUS.ACTIVE, STATUS.BLOCKED ],
        // default: STATUS.HOLD
        default: STATUS.ACTIVE
    },
    joiningDate: {
        type : Date,
        default: new Date()
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: imageSchema,

});

customerSchema.statics.createCustomer = function (customerInfo, callback)  {

    hash(customerInfo.password, HASH_SALT_ROUNDS)
        .then(hashedPassword => {

            customerInfo.password = hashedPassword;
            return this.create(customerInfo);
        })
        .then(newCustomer => {
            if(!newCustomer) {
                throw ("Error creating customer");
            }
            callback(null, newCustomer);
        })
        // .then(user => {
        //
        //     emailHandler.sendEmail(user.email, user, EmailTemplate.type.REGISTER, user.language.name);
        //
        //     return callback(null, user);
        // })
        .catch(err => {
            console.log("here 3");
            return callback(err.message, null);
        })
    ;

};

// customerSchema.statics.getCustomers = function () {
//     return this.getAll();
// };

/**
 * @param object customerInfo
 * @returns promise
 */
customerSchema.statics.getAll = function () {
    return this.find();
};

/**
 * @param object customerId
 * @returns Query
 */

customerSchema.statics.getCustomer = function (customerId) {
    return this.findById(customerId);
};


/**
 * @param object customerInfo
 * @returns promise
 */
customerSchema.methods.updateCustomer = function (customerInfo) {
    return this.update(customerInfo);
};

/**
 * @param object customerInfo
 * @returns promise
 */
customerSchema.methods.removeCustomer = function () {
    return this.remove();
};


module.exports = {
    customerSchema: customerSchema,
    Customer: mongoose.model("Customer", customerSchema),
    STATUS: STATUS,
    //USERTYPE: USER
};