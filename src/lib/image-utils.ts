
import { formatEntryForDisplay } from "./utils";
import { Entry } from "@/types/entry";

/**
 * Formats an entry for display in downloaded images
 * Can be extended with additional formatting options
 */
export const prepareEntryForImage = (entry: Entry): Record<string, string> => {
  return formatEntryForDisplay(entry);
};
