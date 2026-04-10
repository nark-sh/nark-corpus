import { ethers } from 'ethers';
async function getBalanceWithoutHandling(address: string) {
  const provider = new ethers.JsonRpcProvider();
  return await provider.getBalance(address);
}
