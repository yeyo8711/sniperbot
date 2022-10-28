require("dotenv").config();
const { ethers } = require("ethers");
const abi = require("./abi.json");
const RPC = "https://rpc.ankr.com/eth_goerli";
const provider = new ethers.providers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(process.env.PK, provider);
const address = "0x2632f2A5bb8f3C584d7eaDCDA107052726216318"; // Token address
const contract = new ethers.Contract(address, abi, wallet);

/* ----- ROUTER STUFF DO NOT TOUCH ---- */
const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const routerAbi = require("./routerAbi.json");
const router = new ethers.Contract(routerAddress, routerAbi, wallet);
/* ----- ROUTER STUFF DO NOT TOUCH ---- */

const main = async () => {
  let buys = 0;
  const buy = setInterval(async () => {
    const paused = await contract.paused();
    console.log(paused);

    if (paused) {
      const weth = await router.WETH();
      const overrides = {
        value: ethers.utils.parseEther("0.0001"), // amount of ether to buy
        gasLimit: 500000, // you can
      };
      try {
        const tx =
          await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            [weth, address],
            "0x719cf7503838321980387002c16eFDC9BDB278Da",
            Math.floor(Date.now() / 1000) + 60 * 10,
            overrides
          );
        console.log(tx);
        clearInterval(buy);
      } catch (error) {
        console.log(error);
      }

      /* console.log(tx);
      buys++;
      
      console.log("Buys", buys); */
    }
  }, 3000);
};

main();
