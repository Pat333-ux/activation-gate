import { ActivationSnapshot } from "./BeastSystem-ActivationBootstrap";

export interface GenesisLedgerEntry {
  genesisTimestamp: number;
  activationSnapshot: ActivationSnapshot;
  commitHash: string;
}

export function commitGenesisLedger(
  snapshot: ActivationSnapshot,
  commitHash: string
): GenesisLedgerEntry {
  return {
    genesisTimestamp: Date.now(),
    activationSnapshot: snapshot,
    commitHash
  };
}