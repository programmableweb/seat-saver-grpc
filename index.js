const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const {validateEnvVarsSync} = require('./validation');
const {seedVenues} = require('./dataSeeding');
const faker = require('faker');
const dataManager = require('./dataManager');
let server;

const {mapVenueSync, mapSeatSync} = require('./helpers');

const PROTO_PATH = __dirname + '/proto/seatsaver.proto';
const PORT = process.env.PORT || 50051;

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
const seatsaver_proto = grpc.loadPackageDefinition(packageDefinition).seatsaver;

/**
 * Implements the GetVenues RPC method.
 */
function ping(call, callback) {
    const runtimeInfo = {};
    runtimeInfo.envVars = process.env;
    runtimeInfo.currentTime = new Date();
    runtimeInfo.memoryUsage = process.memoryUsage();
    callback(null, {runtimeInfo: JSON.stringify(runtimeInfo)});
}

faker.lorem.words(2);

function pingStream(call){
    const cnt = call.request.streamItemCount || 10;
    for(let i = 0; i< cnt; i++){
        const msg = {message: i + ': ' + faker.lorem.words(2)};
        console.log(msg);
        call.write(msg);
    }
    call.end();
}

async function getVenues(call, callback) {
    const venues = await dataManager.getVenues();
    venues.forEach(venue => {
        call.write(mapVenueSync(venue));
    });
    call.end();
}
async function getVenue(call, callback) {
    const venue = await dataManager.getVenue(call.request.venueId);
    callback(null, mapVenueSync(venue));
}

async function getOpenSeats(call, callback) {
    const seats = await dataManager.getOpenSeats(call.request.venueId);
    seats.forEach(seat => {
        call.write(mapSeatSync(seat));
    });
    call.end();
}

async function getReservedSeats(call, callback) {
    const seats = await dataManager.getReservedSeats(call.request.venueId);
    seats.forEach(seat => {
        call.write(mapSeatSync(seat));
    });
    call.end();
}

async function getSoldSeats(call, callback) {
    const seats = await dataManager.getSoldSeats(call.request.venueId);
    seats.forEach(seat => {
        call.write(mapSeatSync(seat));
    });
    call.end();
}

async function getSeats(call, callback) {
    const venue = await dataManager.getVenue(call.request.venueId);
    venue.seats.forEach(seat => {
        const s = mapSeatSync(seat._doc);
        call.write(s);
    });
    call.end();
}

async function reserveSeat(call, callback) {
    call.request.seat.venueId = call.request.venueId;
    call.request.seat.status = 'RESERVED';
    console.log({message: 'Reserving Seat', seat: call.request.seat});
    const seat = await dataManager.reserveSeat(call.request.seat);
    console.log({message: 'Reserved Seat', seat});
    callback(null, seat);
}

async function releaseSeat(call, callback) {
    call.request.seat.venueId = call.request.venueId;
    call.request.seat.status = 'OPEN';
    console.log({message: 'Releasing Seat', seat: call.request.seat});
    const seat = await dataManager.releaseSeat(call.request.seat);
    console.log({message: 'Released Seat', seat});
    callback(null, seat);
}

async function buySeat(call, callback) {
    call.request.seat.venueId = call.request.venueId;
    call.request.seat.status = 'SOLD';
    console.log({message: 'Buying Seat', seat: call.request.seat});
    const seat = await dataManager.buySeat(call.request.seat);
    console.log({message: 'Seat Bought', seat});
    callback(null, seat);
}
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
async function main()  {
    validateEnvVarsSync();

    const implementations = {};
    implementations.pingStream = pingStream;
    implementations.ping = ping;
    implementations.getVenues = getVenues;
    implementations.getVenue = getVenue;
    implementations.getSeats = getSeats;
    implementations.getReservedSeats = getReservedSeats;
    implementations.getSoldSeats = getSoldSeats;
    implementations.getOpenSeats = getOpenSeats;
    implementations.buySeat = buySeat;
    implementations.releaseSeat = releaseSeat;
    implementations.reserveSeat = reserveSeat;

    server = new grpc.Server();
    server.addService(seatsaver_proto.SeatSaverService.service, implementations);
    server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
    console.log({message: `Starting gRPC Server on port ${PORT}`, startingTime: new Date()});
    server.start();
    console.log({message: `Started gRPC Server on port ${PORT}`, startedTime: new Date()});
}

seedVenues()
    .then(result => {
        return main();
    });

module.exports = {server};