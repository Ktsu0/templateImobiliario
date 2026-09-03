import type { ClientConfig } from "./types";
import { clientConfig as pioneira } from "./clients/pioneira";

const clients: Record<string, ClientConfig> = {
  pioneira,
};

function resolveActiveClientConfig(): ClientConfig {
  const slug = process.env.NEXT_PUBLIC_CLIENT_SLUG;
  if (slug && clients[slug]) {
    return clients[slug];
  }
  return pioneira;
}

export const activeClientConfig: ClientConfig = resolveActiveClientConfig();
