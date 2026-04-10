import { ethers } from 'ethers';
class WalletService {
  private provider = new ethers.JsonRpcProvider();
  async getBalance(address: string) {
    return await this.provider.getBalance(address);
  }
}
