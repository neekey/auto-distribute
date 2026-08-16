// Windmill flow preflight: take the typed discovery config + notion resources
// and return them as a single object. Both parameters are typed Windmill
// resources, so the `$res:...` references passed via flow_input get
// auto-resolved by Windmill at script entry. Subsequent flow steps read the
// resolved values via `results.r.config` / `results.r.notion`.

type DiscoveryConfig = {
  productName: string;
  subs: string[];
  queries: string[];
  productKeywords?: string[];
  excludeAuthors?: string[];
  freshnessDays?: number;
  minHeuristicScore?: number;
  notionDatabaseId: string;
  topN?: number;
};

type Notion = { token: string };

export async function main(
  discoveryConfig: DiscoveryConfig,
  notion: Notion,
): Promise<{ config: DiscoveryConfig; notion: Notion }> {
  return { config: discoveryConfig, notion };
}
