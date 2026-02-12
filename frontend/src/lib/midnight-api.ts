/**
 * Whistlepoddu Platform - Midnight API Integration
 * Company Claim Registration & Verification
 */

export interface CompanyClaim {
  companyName: string;
}

export interface RegisterResult {
  txHash: string;
  contractAddress: string;
}

export interface VerifyResult {
  verified: boolean;
  txHash: string;
}

export interface MidnightWalletAPI {
  getUnshieldedAddress(): Promise<{ unshieldedAddress: string }>;
  getShieldedAddresses(): Promise<{ 
    shieldedAddress: string;
    shieldedCoinPublicKey: string;
    shieldedEncryptionPublicKey: string;
  }>;
  submitTransaction(tx: unknown): Promise<any>;
  balanceUnsealedTransaction(tx: unknown): Promise<any>;
  proveTransaction(tx: unknown): Promise<any>;
  getConfiguration(): Promise<any>;
}

/**
 * Convert company name string to Field value for circuit
 * Using a simple hash-to-field conversion
 */
const companyNameToField = async (companyName: string): Promise<bigint> => {
  const normalized = companyName.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convert first 31 bytes to bigint (Field is typically ~254 bits)
  let fieldValue = 0n;
  for (let i = 0; i < Math.min(31, hashArray.length); i++) {
    fieldValue = (fieldValue << 8n) | BigInt(hashArray[i]);
  }
  
  return fieldValue;
};

export class MidnightDAppAPI {
  private whistlepodduModule: any = null;
  private whistlepodduCompiledContract: any = null;
  private providers: any = null;
  private whistlepodduContract: any = null;
  private wallet: MidnightWalletAPI | null = null;
  private config: any = null;

  constructor() { }

  /** Initialize the API with the Lace wallet instance */
  async initialize(walletAPI: MidnightWalletAPI) {
    const { setNetworkId } = await import("@midnight-ntwrk/midnight-js-network-id");
    setNetworkId('undeployed');
    
    this.wallet = walletAPI;
    this.config = await walletAPI.getConfiguration();

    const { configureProviders } = await import("./providers");
    
    this.providers = await configureProviders({
      config: {
        indexer: this.config.indexerUri,
        indexerWS: this.config.indexerWsUri,
        node: this.config.substrateNodeUri,
        proofServer: `${window.location.origin}/api/proof-server/`, 
      },
      contractName: "whistlepoddu",
      wallet: walletAPI,
    });

    if (!this.whistlepodduModule) {
      this.whistlepodduModule = await import(
        /* webpackIgnore: true */
        "../../../contract/dist/managed/whistlepoddu/contract/index.js"
      );
    }

    const { CompiledContract } = await import("@midnight-ntwrk/compact-js");
    
    this.whistlepodduCompiledContract = (CompiledContract.make(
      "whistlepoddu",
      this.whistlepodduModule.Contract,
    ) as any).pipe(
      (self: any) => (CompiledContract as any).withVacantWitnesses(self),
      (self: any) => (CompiledContract as any).withCompiledFileAssets(self, "/")
    );
  }

  /** Connect to an existing deployed contract */
  async findContract(contractAddress: string) {
    if (!this.providers) throw new Error("API not initialized");
    const { findDeployedContract } = await import("@midnight-ntwrk/midnight-js-contracts");
    
    this.whistlepodduContract = await findDeployedContract(this.providers, {
      compiledContract: this.whistlepodduCompiledContract,
      contractAddress: contractAddress.trim(),
      privateStateId: "whistlepodduPrivateState",
      initialPrivateState: {},
    } as any);
  }

  /** Deploy a new contract instance */
  async deployNewContract(): Promise<RegisterResult> {
    const { deployContract } = await import("@midnight-ntwrk/midnight-js-contracts");

    const deployed = await deployContract(this.providers, {
      privateStateId: "whistlepodduPrivateState",
      compiledContract: this.whistlepodduCompiledContract,
      initialPrivateState: {},
    } as any);
    
    this.whistlepodduContract = deployed;
    
    return {
      contractAddress: deployed.deployTxData.public.contractAddress,
      txHash: deployed.deployTxData.public.txHash,
    };
  }

  /** Register a company claim for a wallet address */
  async registerCompanyClaim(
    claim: CompanyClaim, 
    walletAddress: Uint8Array
  ): Promise<RegisterResult> {
    if (!this.whistlepodduContract) throw new Error("No contract connected");

    const companyNameField = await companyNameToField(claim.companyName);

    const result = await this.whistlepodduContract.callTx.register_company_claim(
      companyNameField,
      new Uint8Array(walletAddress)
    );
    
    const txHash = result.public?.txId || result.txHash || "tx_completed";
    const contractAddr = this.whistlepodduContract.deployTxData?.public?.contractAddress || 
                         this.whistlepodduContract.contractAddress || 
                         "unknown_address";

    return { txHash, contractAddress: contractAddr };
  }
  
  /** Verify a company claim for a wallet address */
  async verifyCompanyClaim(
    claim: CompanyClaim, 
    walletAddress: Uint8Array
  ): Promise<VerifyResult> {
    if (!this.whistlepodduContract) throw new Error("No contract connected");

    const companyNameField = await companyNameToField(claim.companyName);

    try {
      const result = await this.whistlepodduContract.callTx.verify_company_claim(
        companyNameField,
        new Uint8Array(walletAddress)
      );
      
      const txHash = result.public?.txId || result.txHash || "verification_completed";
      
      return { verified: true, txHash };
    } catch (error: any) {
      return { verified: false, txHash: "verification_failed" };
    }
  }

  /** Get the current wallet address from the connected wallet */
  async getWalletAddress(): Promise<Uint8Array> {
    if (!this.wallet) throw new Error("Wallet not initialized");
    
    const { unshieldedAddress } = await this.wallet.getUnshieldedAddress();
    
    const addressBytes = new Uint8Array(32);
    if (unshieldedAddress.startsWith('0x')) {
      const hex = unshieldedAddress.slice(2);
      for (let i = 0; i < Math.min(32, hex.length / 2); i++) {
        addressBytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
      }
    }
    
    return addressBytes;
  }

  /** Check if a wallet is registered (by querying the ledger) */
  async isWalletRegistered(walletAddress: Uint8Array): Promise<boolean> {
    if (!this.whistlepodduContract) throw new Error("No contract connected");
    
    try {
      const ledgerState = await this.whistlepodduContract.ledgerState;
      const walletToCompany = ledgerState?.wallet_to_company;
      
      if (!walletToCompany) return false;
      
      const walletKey = Array.from(walletAddress).join(',');
      return walletToCompany.has(walletKey) || false;
    } catch (error) {
      console.error("Error checking wallet registration:", error);
      return false;
    }
  }
}