import propertiesData from "@/content/clients/meridiano/properties.json";
import type { Property } from "./types";

export function getProperties(): Property[] {
  return propertiesData as Property[];
}
