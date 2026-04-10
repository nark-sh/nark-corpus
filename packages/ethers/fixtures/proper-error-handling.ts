import { ethers } from 'ethers';
async function getBalanceWithHandling(address: string) {
  try {
    const provider = new ethers.JsonRpcProvider();
    return await provider.getBalance(address);
  } catch (error) {
    console.error('RPC error:', error);
    throw error;
  }
}
