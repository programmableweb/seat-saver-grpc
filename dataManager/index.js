const mongoose = require('mongoose');
const _ = require('lodash');
const moption = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

if (!process.env.MONGODB_URL) throw new Error('The required environment variable, MONGODB_URL does not exist or has no value');

const Venue = require('./venue');

const searchByStatus = async (venueId, status)=> {
    const item = await mongoose.connect(process.env.MONGODB_URL, moption)
        .then(result => {
            const rtn = Venue.find({_id: venueId, seats: { $elemMatch: {status: status}} });
            console.log(rtn);
            return rtn;
        });
    if(item.length > 0){
        const arr =  item[0].toObject({ getters: true }).seats;
        return _.filter(arr, { 'status': status});
    }
    return item;
};

const getSeat = async (venueId, seatId)=> {
    const item = await mongoose.connect(process.env.MONGODB_URL, moption)
        .then(result => {
            const rtn = Venue.find({_id: venueId, seats: { $elemMatch: {id: seatId}} });
            console.log(rtn[0]);
            return rtn[0];
        });
    return item;
};

const getSoldSeats = async (venueId) => {
    return await searchByStatus(venueId, 'SOLD');
};

const getOpenSeats = async (venueId) => {
    return await searchByStatus(venueId, 'OPEN');
};

const getReservedSeats = async (venueId) => {
    return await searchByStatus(venueId, 'RESERVED');
};

const getVenues = async ()=>{
    const item = await mongoose.connect(process.env.MONGODB_URL, moption)
        .then(result => {
            console.log({message:`Getting venues at ${new Date()}`});
            const venues = Venue.find({}).lean();
            console.log({message:`Got venues at ${new Date()}`, venues});
            return venues;
        });
    return item;
}
const getVenue = async (id)=>{
    console.log({message:`Getting venue at ${new Date()}`, id});
    const item = await mongoose.connect(process.env.MONGODB_URL, moption)
        .then(result => {

            if(!id) return new Venue();
            return Venue.findById(id);
        });
    console.log({message:`Got venue at ${new Date()}`, id, venue:item});
    return item;

};

const reserveSeat = async (seat)=>{
    seat.status = 'RESERVED';
    return await updateSeat(seat)
};
const buySeat = async (seat)=>{
    seat.status = 'SOLD';
    return await updateSeat(seat)
};
const releaseSeat = async (seat)=>{
    seat.status = 'OPEN';
    return await updateSeat(seat)
};

const updateSeat = async (seat) =>{
    const item = await mongoose.connect(process.env.MONGODB_URL, moption)
        .then(result => {
            //const rtn = Venue.find({_id: seat.venueId, seats: { $elemMatch: {number: seat.number}} });
            const rtn = Venue.update({_id: seat.venueId, seats: { $elemMatch: {number: seat.number}} },
                {$set: {"seats.$.status": seat.status,"seats.$.customer": seat.customer}});
            console.log(rtn);
            return rtn;
        });
    if(item.ok){
        const followup = await mongoose.connect(process.env.MONGODB_URL, moption)
            .then(result => {
                return Venue.find({_id: seat.venueId, seats: { $elemMatch: {number: seat.number}} }).lean();
            });
        if(followup.length > 0){
           const obj = _.find(followup[0].seats, { 'number':  seat.number});
           console.log({message: 'Found seat', seat:obj});
           if(obj) obj.id = obj._id.toString();
           return obj;
        }
    }
    return item


};

const validateDataStore = async() => {
    await mongoose.connect(process.env.MONGODB_URL, moption);
    if(mongoose.connection.readyState === 0 || mongoose.connection.readyState === 0 ){
        throw new Error({message: `Unable to connect to MongoDB with URL ${process.env.MONGODB_URL}`,
            readyState: mongoose.connection.readyState,
            date: new Date()})
    }else{
        const obj  = {message: `Did successful test connection to MongoDB at URL ${process.env.MONGODB_URL}`, date: new Date()};
        return obj;
    }
};

module.exports = {
    validateDataStore,
    getVenues,
    getVenue,
    getSeat,
    getReservedSeats,
    getOpenSeats,
    getSoldSeats,
    reserveSeat,
    buySeat,
    releaseSeat
};


