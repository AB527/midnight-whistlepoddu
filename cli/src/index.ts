import { type WalletContext } from './api.js';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface, type Interface } from 'node:readline/promises';
import { pino } from 'pino';
import { type WhistlepodduProviders, type DeployedWhistlepodduContract } from './common-types.js';
import { type Config, localConfig } from './config.js';
import * as api from './api.js';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

const C = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

const BANNER = `
  ${C.cyan}${C.bold}Midnight Whistlepoddu SERVICE CLI${C.reset}
  ${C.blue}Privacy-preserving identity verification on Midnight${C.reset}
`;

const DIVIDER = `${C.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`;

const WALLET_MENU = `
${DIVIDER}
  ${C.yellow}${C.bold}WALLET SETUP${C.reset}
${DIVIDER}
  ${C.cyan}[1]${C.reset} Create a new wallet
  ${C.cyan}[2]${C.reset} Restore wallet from seed
  ${C.cyan}[3]${C.reset} Exit
${DIVIDER}
> `;

const CONTRACT_MENU = `
${DIVIDER}
  ${C.yellow}${C.bold}CONTRACT MANAGEMENT${C.reset}
${DIVIDER}
  ${C.cyan}[1]${C.reset} Deploy a new Whistlepoddu contract
  ${C.cyan}[2]${C.reset} Join an existing Whistlepoddu contract
  ${C.cyan}[3]${C.reset} Exit
${DIVIDER}
> `;

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

const getWallet = async (config: Config, rli: Interface): Promise<WalletContext | null> => {
  while (true) {
    const choice = await rli.question(WALLET_MENU);
    switch (choice.trim()) {
      case '1': {
        const { ctx, seed, mnemonic } = await api.buildFreshWallet(config);
        console.log(`\n${DIVIDER}`);
        console.log(`  NEW WALLET CREATED!`);
        console.log(`\n  24-WORD MNEMONIC (SAVE THIS!):`);
        console.log(`  ${mnemonic}`);
        console.log(`\n  HEX SEED:`);
        console.log(`  ${seed}`);
        console.log(`\n  [!] PLEASE SAVE YOUR MNEMONIC TO RESTORE YOUR WALLET LATER`);
        console.log(`${DIVIDER}\n`);
        return ctx;
      }
      case '2':
        const seed = await rli.question('Enter your 24-word mnemonic or hex seed: ');
        return await api.buildWalletAndWaitForFunds(config, seed);
      case '3':
        return null;
      default:
        console.log(`Invalid choice: ${choice}`);
    }
  }
};

const deployOrJoin = async (
  providers: WhistlepodduProviders,
  rli: Interface,
): Promise<DeployedWhistlepodduContract | null> => {
  while (true) {
    const choice = await rli.question(CONTRACT_MENU);
    switch (choice.trim()) {
      case '1':
        return await api.deploy(providers);
      case '2':
        const address = await rli.question('Enter the contract address (hex): ');
        return await api.joinContract(providers, address);
      case '3':
        return null;
      default:
        console.log(`Invalid choice: ${choice}`);
    }
  }
};

async function main() {
  console.log(BANNER);
  api.setLogger(logger);
  const rli = createInterface({ input, output });

  try {
    const walletCtx = await getWallet(localConfig, rli);
    if (!walletCtx) return;

    const providers = await api.withStatus('Configuring providers', () => 
      api.configureProviders(walletCtx, localConfig)
    );

    const whistlepodduContract = await deployOrJoin(providers, rli);
    if (!whistlepodduContract) return;

  } catch (err: any) {
    console.error(`\n  FATAL ERROR: ${err.message}`);
  } finally {
    rli.close();
    process.exit(0);
  }
}

main().catch(console.error);
