import propertiesData from "@/content/clients/pioneira/properties.json";
import type { Property } from "./types";

export function getProperties(): Property[] {
  return propertiesData as Property[];
}
