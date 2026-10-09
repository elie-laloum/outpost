export const linearEndpoint = "https://api.linear.app/graphql";
export const linearLimits = {
  responseBytes: 1_048_576,
  tokenBytes: 4096,
  timeoutMs: 15_000,
};
export const viewerQuery = "query OutpostViewer { viewer { id } }";
export const issueQuery = `query OutpostIssue($id: String!) {
  issue(id: $id) { id identifier title description url }
}`;
