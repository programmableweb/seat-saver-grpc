const mapVenueSync = (venueData) => {
    const id = venueData._id.toString();
    const created = venueData.created.toString();
    venueData.id = id;
    venueData.created = created;
    venueData.seats.forEach(seat => {
        mapSeatSync(seat);
    });

    return venueData;
};

const mapSeatSync = (seatData) =>{
    const id = seatData._id.toString();
    const created = seatData.created.toString();
    const changed = seatData.changed.toString();
    seatData.id = id;
    seatData.created = created;
    seatData.changed = changed;
    seatData.customer = mapCustomerSync(seatData.customer)

    return seatData;
};

const mapCustomerSync = (customerData) =>{
    if(customerData){
        if(customerData.created) customerData.created = customerData.created.toString();
        if(customerData.changed) customerData.changed = customerData.changed.toString();
    }
    return customerData;
};

module.exports = {mapVenueSync,mapSeatSync};