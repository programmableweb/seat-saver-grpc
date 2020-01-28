const {getVenue, getVenues} = require('../dataManager');
const faker = require('faker');

const createVenueSync = (venue) =>{
    venue.name = faker.lorem.words(2);
    venue.address = faker.address.streetAddress();
    venue.city = faker.address.city();
    venue.state_province = faker.address.state();
    venue.postal_code = faker.address.zipCode();
    venue.country = 'USA';

    return venue;
};

const createSeatsSync = () => {
    const arr = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < alphabet.length; i++) {
        const letter = alphabet[i];
        for (let j = 0; j < 21; j++) {
            const seat = {};
            seat.number = letter + j;
            seat.section = 'Section-' + letter;
            seat.status = 'OPEN';
            arr.push(seat);
        }
    }
    return arr;
};


const seedVenues = async () => {
    const venues = await getVenues();
    if(!venues || venues.length < 1){
        console.log({message: 'Start Seeding Venue', date: new Date()});
        //make 3 venues
        for(let i = 0; i< 3;i++){
            const seats = createSeatsSync();
            const venue = (createVenueSync(await getVenue()));
            seats.forEach(seat => venue.seats.push(seat));
            const result =  await venue.save();
            console.log(result);
        }
        console.log({message: 'End Seeding Venue', date: new Date()});
    }else{
        console.log({message: 'Venues are already seeded', date: new Date()});
    }
};

module.exports = {seedVenues};

