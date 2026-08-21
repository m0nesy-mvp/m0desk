"use server";

import { searchAll, type SearchResults } from "@/lib/db/search";

export async function searchAllAction(query: string): Promise<SearchResults> {
  return searchAll(query);
}
