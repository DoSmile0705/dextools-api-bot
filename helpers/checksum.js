const crypto = require("crypto");
const regex_solidity_signatures = /63([0-9a-f]{8})1461([0-9a-f]{4})57/gi;

const getChecksum = (bytecode) => {
    const signatures = [];
    const groups = bytecode.matchAll(regex_solidity_signatures);
    for (const match of groups) {
        signatures.push(match[1]);
    }
    return checksum(signatures.join(" ").toString());
};
const checksum = (str, algorithm, encoding) => {
    return `0x${crypto
        .createHash(algorithm || "sha1")
        .update(str, "utf8")
        .digest(encoding || "hex")
        .slice(0, 8)}`;
};

module.exports = {
    getChecksum,
};
