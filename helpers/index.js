const env = require("../env.json");
const ethers = require("ethers");
const provider = new ethers.EtherscanProvider(
	"homestead",
	env.ETHERSCAN_API_KEY
);

// getting wallet history with etherscan api
const getOwner = async (address) => {
	const params = {
		action: "txlist",
		address: address,
		startblock: 0,
		endblock: 99999999,
		sort: "asc",
	};

	const result = await provider.fetch("account", params);
	return result;
};

module.exports = {
	getOwner,
};
