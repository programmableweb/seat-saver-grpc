const expect = require('chai').expect;
const describe = require('mocha').describe;
const it = require('mocha').it;
const validation = require('../validation');
const testHelpers = require('./test-helpers');
describe('Basic Validator Tests: ', () => {
    it('Can Validate Customer ', function (done) {
        const customer = testHelpers.getRandomCustomerSync();
        const result = validation.validateCustomerSync(customer);
        expect(result.errors.length).to.equal(0);
        console.log(result);
        done();
    });
});