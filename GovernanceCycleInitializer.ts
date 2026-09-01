import { loadGenesisState } from "./GenesisStateLoader";
import { GovernanceContext } from "./GovernanceContext";
import { bindDeterministicModules } from "./DeterministicModuleBinder";
import { startGovernanceLoop } from "./GovernanceLoop";
import { commitGovernanceEvent } from "./GovernanceLedger";

export interface GovernanceCycleInitConfig {
  genesisSnapshotPath: string;
  genesisLedgerPath: string;
}

export async function initializeGovernanceCycle(
  config: GovernanceCycleInitConfig
): Promise<GovernanceContext> {
  // 1. Load the Genesis State
  const genesis = loadGenesisState(
    config.genesisSnapshotPath,
    config.genesisLedgerPath
  );

  // 2. Initialize Governance Context
  const context = new GovernanceContext({
    cycle: 1,
    genesisState: genesis,
    proposals: [],
    resolutions: [],
    auditTrail: []
  });

  // 3. Activate Deterministic Governance Modules
  bindDeterministicModules(context);

  // 4. Start Governance Event Loop
  startGovernanceLoop(context);

  // 5. Commit Governance Cycle Initialization
  commitGovernanceEvent(context, {
    type: "GOVERNANCE_CYCLE_INITIALIZED",
    cycle: 1,
    timestamp: Date.now()
  });

  return context;
}

export { GovernanceContext };
