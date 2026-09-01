import { GovernanceContext } from "./GovernanceContext";
import * as Workflows from "./workflows";
import { commitGovernanceEvent } from "./GovernanceLedger";

export interface WorkflowRuntimeConfig {
  cycle: number;
}

export class WorkflowRuntime {
  private context: GovernanceContext;
  private workflows: Map<string, any>;
  private isRunning: boolean = false;

  constructor(context: GovernanceContext) {
    this.context = context;
    this.workflows = new Map();
  }

  /**
   * Bind all workflow definitions to this runtime
   */
  public bind(workflowDefinitions: typeof Workflows): void {
    Object.entries(workflowDefinitions).forEach(([name, workflow]) => {
      this.workflows.set(name, workflow);
    });
  }

  /**
   * Start the deterministic workflow loop
   */
  public start(): void {
    if (this.isRunning) {
      throw new Error("Workflow runtime is already running");
    }

    this.isRunning = true;

    // Activate all workflows in deterministic order
    this.activateProposalIntakeWorkflow();
    this.activateValidationWorkflow();
    this.activateRankingWorkflow();
    this.activateResolutionWorkflow();
    this.activateAuditWorkflow();
    this.activateStateTransitionWorkflow();
  }

  private activateProposalIntakeWorkflow(): void {
    const workflow = this.workflows.get("proposalIntake");
    if (workflow) workflow.execute(this.context);
  }

  private activateValidationWorkflow(): void {
    const workflow = this.workflows.get("validation");
    if (workflow) workflow.execute(this.context);
  }

  private activateRankingWorkflow(): void {
    const workflow = this.workflows.get("ranking");
    if (workflow) workflow.execute(this.context);
  }

  private activateResolutionWorkflow(): void {
    const workflow = this.workflows.get("resolution");
    if (workflow) workflow.execute(this.context);
  }

  private activateAuditWorkflow(): void {
    const workflow = this.workflows.get("audit");
    if (workflow) workflow.execute(this.context);
  }

  private activateStateTransitionWorkflow(): void {
    const workflow = this.workflows.get("stateTransition");
    if (workflow) workflow.execute(this.context);
  }

  public stop(): void {
    this.isRunning = false;
  }

  public static reinitialize(context: GovernanceContext): WorkflowRuntime {
    const runtime = new WorkflowRuntime(context);
    runtime.bind(Workflows);
    runtime.start();
    return runtime;
  }
}

export async function initializeWorkflowRuntime(
  context: GovernanceContext
): Promise<WorkflowRuntime> {
  // 1. Load the active governance context
  // (context is passed as parameter)

  // 2. Import workflow definitions
  // (Workflows imported at top)

  // 3. Bind workflows to the runtime
  const workflowRuntime = new WorkflowRuntime(context);
  workflowRuntime.bind(Workflows);

  // 4. Start deterministic workflow loop
  workflowRuntime.start();

  // 5. Commit workflow runtime initialization to the ledger
  commitGovernanceEvent(context, {
    type: "WORKFLOW_RUNTIME_INITIALIZED",
    cycle: context.cycle,
    timestamp: Date.now()
  });

  return workflowRuntime;
}

export { GovernanceContext };
