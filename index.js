const env = require("./env.json");
const ethers = require("ethers");
const axios = require("axios");
const fetch = require("node-fetch");
const ethereumUtil = require("ethereumjs-util");
const provider = new ethers.WebSocketProvider(env.NODE);
const { BLACKLISTED } = require("./helpers/addresses.json");
const { methods } = require("./helpers/methods");
const { decodeTx } = require("./helpers/decodeTx");
const { sendMessage } = require("./helpers/message");
const { addToBlacklist } = require("./helpers/database");

let transactions = {};
let tmp = {};
const THRESHOLD = 6000; // 6 seconds
const TRANSACTIONS = 6; // 6 transactions
const apiKey = env.ETHERSCAN_API_KEY;

async function getContractBalance(contractAddress, apiKey) {
	const apiUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${contractAddress}&apikey=${apiKey}`;

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();
		if (data.status === "1") {
			const balanceInWei = data.result;
			return balanceInWei;
		} else {
			return 0;
		}
	} catch (error) {
		return 0;
	}
}

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
			return ownerAddress;
		} else {
			return "";
		}
	} catch (error) {
		return "";
	}
}

const start = async () => {
	const createTransactionObject = (
		tx,
		currentTime,
		decodedTx,
		contractBalance
	) => {
		return {
			tx: tx,
			timestamp: currentTime,
			decodedTx: decodedTx,
			contractBalance: contractBalance,
		};
	};

	console.log(`Bot started...`);
	provider.on("pending", async (txHash) => {
		const startTime = performance.now();
		const maxRetries = 2;
		let retries = 0;

		while (retries < maxRetries) {
			try {
				const tx = await provider.getTransaction(txHash);
				if (!tx || !tx.to) return;

				if (!methods.includes(tx.data.slice(0, 10))) return;
				const gasPrice = tx.gasPrice || tx.maxFeePerGas;
				if (gasPrice < ethers.parseUnits("5", "gwei")) return; // to avoid fake buy spam
				const decodedTx = decodeTx(tx);

				if (!decodedTx) return;
				const tokenAddress = decodedTx.path[decodedTx.path.length - 1];

				if (BLACKLISTED.includes(tokenAddress.toLowerCase())) return; // don't send message for blacklisted tokens

				console.log(
					`Found ${decodedTx.method} transaction for ${tokenAddress}`
				);
				// if (tx.nonce === 0) addToBlacklist(tx.from); // add as scammer if first transaction is 0 nonce (lazy way to get scammers)

				//create contract adress and calculate the contract balance.
				// const senderAddress = tx.from;
				// const nonce = tx.nonce;

				// const encodedData = ethereumUtil.rlp.encode([senderAddress, nonce]);
				// const contractAddress =
				// 	"0x" + ethereumUtil.keccak256(encodedData).slice(12).toString("hex");
				const contractAddress = tx.to;
				const contractBalance = await getContractBalance(
					contractAddress,
					apiKey
				);

				// const ownerAdress = await getOwnerAdress(contractAddress);
				// create transactions[tokenAdress] with necessary parameters.
				if (!transactions[tokenAddress]) {
					transactions[tokenAddress] = [
						createTransactionObject(tx, startTime, decodedTx, contractBalance),
					];
					tmp[tokenAddress] = [transactions[tokenAddress].timestamp];
				} else {
					transactions[tokenAddress].push(
						createTransactionObject(tx, startTime, decodedTx, contractBalance)
					);
					transactions[tokenAddress].timestamp = startTime;
					tmp[tokenAddress].push(transactions[tokenAddress].timestamp);
				}

				let deltaTime = Math.abs(startTime - tmp[tokenAddress][0]);
				let transactionCount = transactions[tokenAddress].length;

				if (transactionCount >= TRANSACTIONS) {
					if (deltaTime <= THRESHOLD) {
						const ownerAdress = await getOwnerAdress(contractAddress);
						await sendMessage(
							transactions[tokenAddress],
							provider,
							tokenAddress,
							deltaTime,
							transactionCount,
							ownerAdress
						);
						time(startTime);
						transactions[tokenAddress] = [];
						tmp[tokenAddress] = [];
					} else {
						transactions[tokenAddress].shift();
						tmp[tokenAddress].shift();
					}
				}
				break;
			} catch (error) {
				// Increase wait time between retries (exponential backoff)
				const waitTime = Math.pow(2, retries) * 1000; // in milliseconds
				await new Promise((resolve) => setTimeout(resolve, waitTime));

				retries++;
			}
		}
	});
};

const time = (startTime) => {
	const endTime = performance.now();
	const time = endTime - startTime;
	console.log(`Time: ${time} ms`);
};

start();
