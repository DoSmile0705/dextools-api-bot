const fetch = require("node-fetch");
const ethereumUtil = require("ethereumjs-util");
const apiKey = "EZ5RMV7TKT16M65UZ18DPPEVE8SK4HWCWR";

// const senderAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
// const nonce = 1;

const axios = require("axios");

// const contractAddress = "0x2aE9c12D8356f11d1Be6C4e91Fe64C10783D42E5";

// const apiUrl = `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${apiKey}`;

// const { ethers } = require("hardhat");

// async function main() {
// 	const [owner] = await ethers.getSigners(
// 		"0xdAC17F958D2ee523a2206206994597C13D831ec7"
// 	);

// 	console.log("owner adress==>", owner.address);
// }

// main();
async function getOwnerAdress(contractAddress) {
	try {
		const response = await axios.get(`https://api.etherscan.io/api`, {
			params: {
				module: "contract",
				action: "getcontractcreation",
				contractaddresses: contractAddress,
				apikey: apiKey,
			},
		});
		const contractInfo = response.data.result[0];
		if (contractInfo) {
			const ownerAddress = contractInfo.contractCreator;
			console.log(ownerAddress);
			return ownerAddress;
		} else {
			return "";
		}
	} catch (error) {
		return "";
	}
}

getOwnerAdress("0x388C818CA8B9251b393131C08a736A67ccB19297");

// async function getTokenSupply() {
// 	try {
// 		const response = await axios.get(apiUrl);
// 		const data = response.data;

// 		if (data.status === "1") {
// 			let tokenSupply = data.result.EthSupply;
// 			tokenSupply = BigInt(tokenSupply);
// 			let result = (await tokenSupply) / BigInt("10" + "0".repeat(18));
// 			console.log(result);
// 			// return tokenSupply;
// 		} else {
// 			return 0;
// 		}
// 	} catch (error) {
// 		return 0;
// 	}
// }

// getTokenSupply();

// async function getMarketCap(symbol) {
// 	try {
// 		const response = await axios.get(
// 			`https://api.coingecko.com/api/v3/simple/price`,
// 			{
// 				params: {
// 					ids: symbol.toLowerCase(),
// 					vs_currencies: "usd",
// 				},
// 			}
// 		);
// 		// console.log("what is this?", response);

// 		const marketCap = response.data[symbol.toLowerCase()].usd;
// 		console.log(`Market Cap of ${symbol}: $${marketCap}`);
// 	} catch (error) {
// 		console.error(`Error fetching market cap: ${error.message}`);
// 	}
// }

// // Example usage
// getMarketCap("ethereum");

// async function getTokenSupply(tokenAddress) {
// 	const apiUrl = `https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${tokenAddress}&apikey=${apiKey}`;

// 	try {
// 		const response = await axios.get(apiUrl);
// 		const data = response.data;
// 		console.log("data=>", data);

// 		if (data.status === "1") {
// 			const tokenSupply = data.result;
// 			console.log(`Total Supply: ${tokenSupply}`);
// 			return tokenSupply;
// 		} else {
// 			console.error(`Error: ${data.message}`);
// 		}
// 	} catch (error) {
// 		console.error("Error fetching token supply:", error.message);
// 	}
// }

// const tokenAddress = "0xE57657C2e4D824e10c042b2DB2dDC667CDA832EB"; // Replace with the actual token address
// getTokenSupply(tokenAddress);

// async function getContractInfo() {
// 	try {
// 		const response = await axios.get(`https://api.etherscan.io/api`, {
// 			params: {
// 				module: "contract",
// 				action: "getsourcecode",
// 				address: contractAddress,
// 				apikey: apiKey,
// 			},
// 		});

// 		const contractInfo = response.data.result[0];
// 		if (contractInfo) {
// 			const ownerAddress = contractInfo.ConstructorArguments[0];
// 			//   console.log(`Owner Address: ${ownerAddress}`);
// 		} else {
// 			console.log(`Contract information not found.`);
// 		}
// 	} catch (error) {
// 		console.error(`Error fetching contract information: ${error.message}`);
// 	}
// }

// getContractInfo();
