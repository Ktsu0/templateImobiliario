import type { ClientConfig } from "./types";
import { clientConfig as meridiano } from "./clients/meridiano";

const clients: Record<string, ClientConfig> = {
  meridiano,
};

function resolveActiveClientConfig(): ClientConfig {
  const slug = process.env.NEXT_PUBLIC_CLIENT_SLUG;
  if (slug && clients[slug]) {
    return clients[slug];
  }
  return meridiano;
}

export const activeClientConfig: ClientConfig = resolveActiveClientConfig();
