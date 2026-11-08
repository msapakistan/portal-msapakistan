import { trpc } from "@/lib/trpc";

export type ModuleAccessLevel = "view" | "comment" | "edit";

export interface ModuleAccessResult {
  /** Access level for a given module id, or null if not loaded yet. */
  getAccess: (moduleId: string) => ModuleAccessLevel | null;
  /** Whether the user has at least the required level for a module. */
  hasAccess: (moduleId: string, required: ModuleAccessLevel) => boolean;
  /** Raw access map from the server. */
  access: Record<string, ModuleAccessLevel> | null;
  /** Whether a module is globally available in the current development phase. */
  isModuleEnabled: (moduleId: string) => boolean;
  /** Whether the query is still loading. */
  loading: boolean;
}

const RANK: Record<ModuleAccessLevel, number> = { view: 0, comment: 1, edit: 2 };
const MODULE_ALIASES: Record<string, string> = {
  "nef-nrf": "nef",
  config: "settings",
  modules: "settings",
  "governance-config": "governance",
  lifecycle: "members",
  cards: "members",
  audit: "settings",
  officials: "settings",
};
const KNOWN_MODULE_IDS = new Set([
  "activities",
  "events",
  "chapters",
  "members",
  "recruitment",
  "finance",
  "governance",
  "elections",
  "documents",
  "training",
  "projects",
  "meetings",
  "communications",
  "nef",
  "credentials",
  "volunteer",
  "recognition",
  "settings",
]);
const CORE_MODULE_IDS = new Set(["members", "recruitment"]);

/**
 * Returns the current user's per-module access levels.
 *
 * Example:
 *   const { hasAccess } = useModuleAccess();
 *   if (!hasAccess("finance", "edit")) { /* hide the submit button *\/ }
 */
export function useModuleAccess(): ModuleAccessResult {
  const { data, isLoading } = trpc.modulePermissions.myAccess.useQuery(
    undefined,
    {
      staleTime: 5 * 60 * 1000, // cache for 5 min — permissions change rarely
      refetchOnWindowFocus: false,
    },
  );

  const access = data?.access ?? null;
  const enabledModules = data?.enabledModules ?? null;

  const getAccess = (moduleId: string): ModuleAccessLevel | null => {
    if (!access) return null;
    return (access[moduleId] as ModuleAccessLevel) ?? "view";
  };

  const hasAccess = (moduleId: string, required: ModuleAccessLevel): boolean => {
    if (!access) return false;
    const actual = (access[moduleId] as ModuleAccessLevel) ?? "view";
    return RANK[actual] >= RANK[required];
  };

  const isModuleEnabled = (moduleId: string): boolean => {
    const canonicalModuleId = MODULE_ALIASES[moduleId] ?? moduleId;
    if (!enabledModules) {
      if (isLoading) return true;
      return (
        CORE_MODULE_IDS.has(canonicalModuleId) ||
        !KNOWN_MODULE_IDS.has(canonicalModuleId)
      );
    }
    return enabledModules[canonicalModuleId] ?? true;
  };

  return { getAccess, hasAccess, access, isModuleEnabled, loading: isLoading };
}
