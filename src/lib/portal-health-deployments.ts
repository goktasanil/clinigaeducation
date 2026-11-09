import deployments from "@/data/portal-health-deployments.json";

export type PortalHealthFunction = "iyzico-health" | "portal-commerce-health";
type HealthDeployments = {
  schemaVersion: number;
  projectRef: string;
  functions: Partial<Record<PortalHealthFunction, { deployment: string }>>;
};

/** Skip only a reviewed, missing health endpoint on its exact project origin.
 * This never authorizes a payment or changes a provider's configuration.
 */
export function isKnownUndeployedPortalHealth(
  baseUrl: string,
  name: PortalHealthFunction,
  snapshot: HealthDeployments = deployments,
): boolean {
  if (snapshot.schemaVersion !== 1 || snapshot.functions[name]?.deployment !== "not_deployed")
    return false;
  try {
    const url = new URL(baseUrl);
    return (
      url.origin === `https://${snapshot.projectRef}.supabase.co` &&
      url.pathname === "/" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
