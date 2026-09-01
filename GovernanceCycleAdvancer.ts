import { GovernanceContext } from "./GovernanceContext";
import { validateCycleCompletion } from "./CycleValidator";
import { bindDeterministicModules } from "./DeterministicModuleBinder";
import { WorkflowRuntime } from "./WorkflowRuntime";
import { commitGovernanceEvent } from "./GovernanceLedger";

export interface CycleAdvancementConfig {
  fromCycle: number;
  toCycle: number;
}

export async function advanceGovernanceCycle(
  context: GovernanceContext,
  config: CycleAdvancementConfig
): Promise<GovernanceContext> {
  // 1. Load the active governance context
  // (context is passed as parameter)

  // 2. Validate cycle-completion conditions
  const ready = validateCycleCompletion(context);
  if (!ready) {
    throw new Error(
      `Cycle ${config.fromCycle} not ready for advancement - validation failed`
    );
  }

  // 3. Increment the governance cycle
  context.cycle = config.toCycle;

  // 4. Reset cycle-specific queues
  context.proposals = [];
  context.resolutions = [];
  context.auditTrail.push({
    event: "CYCLE_ADVANCED",
    from: config.fromCycle,
    to: config.toCycle,
    timestamp: Date.now()
  });

  // 5. Rebind deterministic modules
  bindDeterministicModules(context);

  // 6. Reinitialize workflow runtime
  WorkflowRuntime.reinitialize(context);

  // 7. Commit cycle advancement to the ledger
  commitGovernanceEvent(context, {
    type: "GOVERNANCE_CYCLE_ADVANCED",
    from: config.fromCycle,
    to: config.toCycle,
    timestamp: Date.now()
  });

  return context;
}

export { GovernanceContext };
