const input = require("input"); // npm i input
const { getChecksum } = require('./helpers/checksum');
const { getOwner } = require('./helpers/index');
const { isScamChecksum, addChecksum } = require('./helpers/database');

(async () => {
    console.log("Bot starting...");

    // user needs to input the address
    const address = await input.text("Enter the address: ");

    console.log("Checking address...", address);

    // get the checksum
    const owner = await getOwner(address)
    const checksum = getChecksum(owner[0].input);

    // check if the checksum is in the database
    if (isScamChecksum(checksum)) {
        console.log("This address is already in the database!");
        return;
    } else {
        // if it's not, we add it
        addChecksum(checksum);
        console.log("Checksum added!");
    }


})();