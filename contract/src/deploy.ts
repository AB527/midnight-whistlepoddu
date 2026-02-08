import path from 'path';
import * as fs from 'fs';
import * as readline from 'readline/promises';
import * as api from './api';
import { currentDir, UndeployedConfig } from './config';
import { createLogger } from './logger';
import 'dotenv/config';

let logger: Awaited<ReturnType<typeof createLogger>>;

async function main() {
  console.log('Midnight Contract Deployment\n');
  console.log('Using local network with existing containers...\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let wallet: api.WalletContext | null = null;

  try {
    const logDir = path.resolve(
      currentDir,
      '..',
      'logs',
      'deploy',
      `${new Date().toISOString()}.log`
    );

    logger = await createLogger(logDir);
    api.setLogger(logger);

    const choice = await rl.question(
      'Do you have a wallet seed? (y/n, default: n): '
    );

    let walletSeed: string;

    if (choice.toLowerCase().startsWith('y')) {
      walletSeed = await rl.question(
        'Enter your 64-character hex seed: '
      );

      if (walletSeed.length !== 64) {
        throw new Error('Seed must be exactly 64 hexadecimal characters.');
      }
    } else {
      walletSeed =
        '0000000000000000000000000000000000000000000000000000000000000001';
      console.log('\nUsing genesis wallet seed for local network.\n');
    }

    rl.close();

    const config = new UndeployedConfig();

    console.log('Building wallet...');
    wallet = await api.buildWalletFromHexSeed(config, walletSeed);

    const walletAddress =
      wallet.unshieldedKeystore.getBech32Address().asString();

    console.log(`Wallet Address: ${walletAddress}`);

    const { total } = await api.displayWalletBalances(wallet.wallet);
    console.log(`Balance: ${total} tSTAR\n`);

    console.log('Configuring providers...');
    const providers = await api.configureProviders(wallet, config);

    console.log('Deploying contract. This may take 30–60 seconds...');
    const deployedContract = await api.deploy(providers, {
      privateCounter: 0,
    });

    const contractAddress =
      deployedContract.deployTxData.public.contractAddress;

    const deploymentInfo = {
      contractAddress,
      deployedAt: new Date().toISOString(),
      network: 'local',
      walletAddress,
      config: {
        indexer: config.indexer,
        indexerWS: config.indexerWS,
        node: config.node,
        proofServer: config.proofServer,
      },
    };

    const deploymentPath = path.resolve(
      currentDir,
      '..',
      'deployment.json'
    );

    fs.writeFileSync(
      deploymentPath,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('\nCONTRACT DEPLOYED SUCCESSFULLY');
    console.log(`Contract Address: ${contractAddress}\n`);
    console.log(`Deployment info saved at: ${deploymentPath}`);

    process.on('SIGINT', async () => {
      if (wallet) await api.closeWallet(wallet);
      process.exit(0);
    });

    await new Promise(() => {});
  } catch (error) {
    rl.close();
    if (wallet) await api.closeWallet(wallet);
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
