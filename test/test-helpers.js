const faker = require('faker');

const getRandomCustomerSync = () => {
    const obj = {};
    obj.firstName = faker.name.firstName();
    obj.lastName = faker.name.lastName();
    const email = `${obj.firstName}.${obj.lastName}@${faker.internet.domainName()}`;
    obj.email = email;

    return obj;
}

const getRandomSeatCustomerSync = () => {
    const obj = {};
    obj.firstName = faker.name.firstName();
    obj.lastName = faker.name.lastName();
    const email = `${obj.firstName}.${obj.lastName}@${faker.internet.domainName()}`;
    obj.email = email;
    obj.created = null;
    obj.message = null;

    return obj;
};
module.exports = {getRandomCustomerSync, getRandomSeatCustomerSync};