export const workflowDecisionSignatureDomain = "outpost.workflow-decision.v1";
export const workflowDecisionKeyIdMaxLength = 512;
export const workflowDecisionSignaturePattern = /^[A-Za-z0-9_-]{86}$/;
export const workflowDecisionActions = ["approve", "resume", "reject"] as const;
