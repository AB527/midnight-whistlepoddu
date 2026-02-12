import { Whistlepoddu, type WhistlepodduPrivateState } from '@midnight-whistlepoddu/contract';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { ImpureCircuitId } from '@midnight-ntwrk/compact-js';

export type WhistlepodduCircuits = ImpureCircuitId<Whistlepoddu.Contract<WhistlepodduPrivateState>>;

export const WhistlepodduPrivateStateId = 'whistlepodduPrivateState';

export type WhistlepodduProviders = MidnightProviders<WhistlepodduCircuits, typeof WhistlepodduPrivateStateId, WhistlepodduPrivateState>;

export type WhistlepodduContract = Whistlepoddu.Contract<WhistlepodduPrivateState>;

export type DeployedWhistlepodduContract = DeployedContract<WhistlepodduContract> | FoundContract<WhistlepodduContract>;
