const SERVER_URL = 'localhost:50051';
const PROTO_PATH = process.cwd() + '/proto/seatsaver.proto';
const testHelpers = require('./test-helpers');
const validation = require('../validation');

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const seatsaver = grpc.loadPackageDefinition(packageDefinition).seatsaver;
const client = new seatsaver.SeatSaverService(SERVER_URL,
    grpc.credentials.createInsecure());

const expect = require('chai').expect;
const describe = require('mocha').describe;
const it = require('mocha').it;

const sample = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
};

describe('Basic Grpc Tests: ', () => {
    it('Can Ping Server ', function (done) {
        function pingCallback(error, result) {
            if (error) {
                console.log(error);
                done(error);
            }
            expect(result).to.be.an('object');
            done()
        }

        client.Ping({}, pingCallback);
    });

    it('Can Get Venues and Reserve Seats', function (done) {
        const call = client.GetVenues({});
        call.on('data', function (result) {
            expect(result).to.be.an('object');
            const obj = {seat: sample(result.seats), venueId: result.id};
            obj.seat.customer = testHelpers.getRandomCustomerSync();
            function reserveSeatCallback(error, result) {
                if (error) {
                    console.log(error);
                    done(error);
                }
                expect(result).to.be.an('object');
                expect(result.status).to.equal('RESERVED');
                expect(result.customer).to.be.an('object');
            }
            client.ReserveSeat(obj, reserveSeatCallback);
        });
        call.on('end', function () {
            done();
        });
        call.on('error', function (e) {
            console.log(error);
            done(error);
        });
        call.on('status', function (status) {
            console.log(status);
        });
    });

    it('Can Get Seats in Venue', function (done) {
        const call = client.GetSeats({});
        call.on('data', function (result) {
            const validated = validation.validateSeatSync(result);
            expect(validated.error.length).to.equal(0);
            expect(result).to.be.an('object');
            expect(result.number).to.be.a('string');
            expect(result.section).to.be.a('string');
        });
        call.on('end', function () {
            done();
        });
        call.on('error', function (e) {
            console.log(error);
            done(error);
        });
        call.on('status', function (status) {
            console.log(status);
        });
    });

    it('Can Get Venues and Release Seats', function (done) {
        const call = client.GetVenues({});
        call.on('data', function (result) {
            expect(result).to.be.an('object');
            const obj = {seat: sample(result.seats), venueId: result.id};
            function releaseSeatCallback(error, result) {
                if (error) {
                    console.log(error);
                    done(error);
                }
                expect(result).to.be.an('object');
                expect(result.status).to.equal('OPEN');
                expect(result.customer).to.be.a('null');
            }
            client.ReleaseSeat(obj, releaseSeatCallback);
        });
        call.on('end', function () {
            done();
        });
        call.on('error', function (e) {
            console.log(error);
            done(error);
        });
        call.on('status', function (status) {
            console.log(status);
        });
    });

    it('Can Get Venues and Buy Seats', function (done) {
        const call = client.GetVenues({});
        call.on('data', function (result) {
            expect(result).to.be.an('object');

            const validated = validation.validateVenueSync(result);
            expect(validated.errors.length).to.equal(0);

            const obj = {seat: sample(result.seats), venueId: result.id};
            obj.seat.customer = testHelpers.getRandomCustomerSync();
            function buySeatCallback(error, result) {
                if (error) {
                    console.log(error);
                    done(error);
                }
                expect(result).to.be.an('object');
                expect(result.status).to.equal('SOLD');
                expect(result.customer).to.be.an('object');
                done()
            }
            client.BuySeat(obj, buySeatCallback);
        });
        call.on('end', function () {
            done();
        });
        call.on('error', function (e) {
            console.log(error);
            done(error);
        });
        call.on('status', function (status) {
            console.log(status);
        });
    });
});