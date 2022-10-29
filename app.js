require("dotenv").config();
const {
  ChainId,
  Token,
  WETH,
  Fetcher,
  Trade,
  Route,
  TokenAmount,
  TradeType,
} = require("@uniswap/sdk");
const { ethers } = require("ethers");
const abi = require("./abi.json");
const erc20abi = require("./ERC20ABI.json");
const RPC =
  "https://eth-goerli.g.alchemy.com/v2/GBp6U_TjsCoSO24-Vxp6VoHiz4GrVYky"; // CHANGE TO MAIN NET!!
const provider = new ethers.providers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(process.env.PK, provider);
const tokenAddress = "0x2632f2A5bb8f3C584d7eaDCDA107052726216318"; // TOKEN ADDRESS!!!!
const contract = new ethers.Contract(tokenAddress, abi, wallet);
const lpabi = require("./liquidityABI.json");

/* ----- ROUTER STUFF DO NOT TOUCH ---- */
const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const routerAbi = require("./routerAbi.json");
const router = new ethers.Contract(routerAddress, routerAbi, wallet);
/* ----- ROUTER STUFF DO NOT TOUCH ---- */

const main = async () => {
  let buys = 0;
  console.log("listening");
  const tokenContract = new ethers.Contract(tokenAddress, erc20abi, wallet);
  /*------- SDK STUFF ------ */
  const tokenToBuy = new Token(ChainId.GÖRLI, tokenAddress, 18); // CHANGE TO MAIN NET!!
  const chainId = ChainId.GÖRLI; // CHANGE TO MAIN NET!!

  const pair = await Fetcher.fetchPairData(
    tokenToBuy,
    WETH[tokenToBuy.chainId]
  );

  /*------- SDK STUFF ------ */

  // LISTEN TO SWAP EVENT //
  tokenContract.on("Transfer", (from, to, value, event) => {
    if (
      from === pair.liquidityToken.address &&
      buys < 1 /* NUMBER OF BUYS YOU WANT*/
    ) {
      buys += 1;
      buy();
    }
  });
  const buy = async () => {
    const weth = await router.WETH();
    const overrides = {
      value: ethers.utils.parseEther("0.0001"), // AMOUNT OF ETHER TO BUY
      gasLimit: 500000,
      /* IMPROTANT!!!! GAS!!!!
      500K GAS MINIMUM TO 2M GAS TO INCREASE TRANSACTION SPEED*/
    };

    const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
      0,
      [weth, tokenAddress],
      "0x719cf7503838321980387002c16eFDC9BDB278Da", // ADD YOUR WALLET ADDRESS HERE
      Math.floor(Date.now() / 1000) + 60 * 10,
      overrides
    );
    console.log(tx);
  };
};

main();
