import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Product,
  ProductVariant,
  ProductImage,
  Category,
} from "@/lib/api/products";

/**
 * Search Store with Smart Caching
 *
 * This store automatically refreshes on every screen reload but intelligently uses
 * localStorage cache to avoid unnecessary API calls:
 *
 * - On page reload: Always calls initializeSearchData()
 * - If cached data exists and is fresh (< 30 seconds): Uses cache, no API call
 * - If cached data is stale or missing: Makes API call to refresh
 * - If API fails but cache exists: Continues using cached data
 *
 * This ensures users always get fresh data while minimizing server load.
 */

// Define types that were missing
export interface ProductSearchData extends Product {
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
  tags?: string;
  material?: string;
  brand?: string;
  featured?: boolean;
}

export interface CategoryWithChildren extends Category {
  children?: Category[];
}

export interface SearchInitData {
  products: ProductSearchData[];
  categories: CategoryWithChildren[];
}

// Get search initialization data
export async function getSearchInitData(): Promise<SearchInitData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "https://sopa-deal-production.up.railway.app"}/products/search-init-data`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch search data: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

// Search result type for filtered products
export interface SearchResult {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: {
    url: string;
    type: string;
  }[];
  variants?: {
    id: string;
    price: number;
    size: string;
    color: string;
    stock: number;
  }[];
  tags?: string;
  material?: string;
  brand?: string;
  featured?: boolean;
}

interface SearchState {
  // Search data
  products: ProductSearchData[];
  categories: CategoryWithChildren[];
  isInitialized: boolean;
  lastUpdated: number | null;

  // Search functionality
  searchQuery: string;
  filteredResults: SearchResult[];

  // Actions
  initializeSearchData: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  searchProducts: (query: string) => SearchResult[];
  forceRefresh: () => Promise<void>;
}

// Search utility functions
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();
}

// Super enhanced fuzzy search with multiple typo tolerance algorithms
function fuzzyMatch(text: string, query: string): boolean {
  if (!query || !text) return false;

  const normalizedText = text.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  // Exact match
  if (normalizedText.includes(normalizedQuery)) return true;

  // Split both text and query into words for better matching
  const textWords = normalizedText.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);

  // Check if any query word fuzzy matches any text word using multiple algorithms
  return queryWords.some((queryWord) => {
    if (queryWord.length < 2) return normalizedText.includes(queryWord);

    return textWords.some((textWord) => {
      // 1. Direct substring match
      if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        return true;
      }

      // 2. Phonetic matching (Soundex-like)
      if (soundexMatch(textWord, queryWord)) {
        return true;
      }

      // 3. Keyboard distance matching
      if (keyboardDistanceMatch(textWord, queryWord)) {
        return true;
      }

      // 4. Enhanced Levenshtein with higher tolerance
      const distance = levenshteinDistance(textWord, queryWord);
      const maxLength = Math.max(textWord.length, queryWord.length);
      const tolerance = Math.max(2, Math.floor(maxLength * 0.4)); // 40% tolerance

      if (distance <= tolerance) {
        return true;
      }

      // 5. Jaro-Winkler similarity for transpositions
      if (jaroWinklerSimilarity(textWord, queryWord) > 0.7) {
        return true;
      }

      // 6. N-gram matching for partial similarities
      if (ngramSimilarity(textWord, queryWord) > 0.6) {
        return true;
      }

      // 7. Common subsequence matching
      if (
        longestCommonSubsequence(textWord, queryWord) /
          Math.max(textWord.length, queryWord.length) >
        0.6
      ) {
        return true;
      }

      return false;
    });
  });
}

// Phonetic matching using simplified Soundex algorithm
function soundexMatch(word1: string, word2: string): boolean {
  const soundex1 = generateSoundex(word1);
  const soundex2 = generateSoundex(word2);
  return soundex1 === soundex2;
}

function generateSoundex(word: string): string {
  if (!word) return "";

  const soundexMap: { [key: string]: string } = {
    b: "1",
    f: "1",
    p: "1",
    v: "1",
    c: "2",
    g: "2",
    j: "2",
    k: "2",
    q: "2",
    s: "2",
    x: "2",
    z: "2",
    d: "3",
    t: "3",
    l: "4",
    m: "5",
    n: "5",
    r: "6",
  };

  let soundex = word[0].toUpperCase();
  let prevCode = soundexMap[word[0].toLowerCase()] || "";

  for (let i = 1; i < word.length && soundex.length < 4; i++) {
    const char = word[i].toLowerCase();
    const code = soundexMap[char] || "";

    if (code && code !== prevCode) {
      soundex += code;
    }

    if (!"aeiouyhw".includes(char)) {
      prevCode = code;
    }
  }

  return soundex.padEnd(4, "0").substring(0, 4);
}

// Keyboard distance matching for common typos
function keyboardDistanceMatch(word1: string, word2: string): boolean {
  if (Math.abs(word1.length - word2.length) > 2) return false;

  const keyboardLayout: { [key: string]: string[] } = {
    q: ["w", "a"],
    w: ["q", "e", "s"],
    e: ["w", "r", "d"],
    r: ["e", "t", "f"],
    t: ["r", "y", "g"],
    y: ["t", "u", "h"],
    u: ["y", "i", "j"],
    i: ["u", "o", "k"],
    o: ["i", "p", "l"],
    p: ["o", "l"],
    a: ["q", "s", "z"],
    s: ["a", "w", "d", "x"],
    d: ["s", "e", "f", "c"],
    f: ["d", "r", "g", "v"],
    g: ["f", "t", "h", "b"],
    h: ["g", "y", "j", "n"],
    j: ["h", "u", "k", "m"],
    k: ["j", "i", "l"],
    l: ["k", "o", "p"],
    z: ["a", "s", "x"],
    x: ["z", "s", "d", "c"],
    c: ["x", "d", "f", "v"],
    v: ["c", "f", "g", "b"],
    b: ["v", "g", "h", "n"],
    n: ["b", "h", "j", "m"],
    m: ["n", "j", "k"],
  };

  let differences = 0;
  const maxLength = Math.max(word1.length, word2.length);

  for (let i = 0; i < maxLength; i++) {
    const char1 = word1[i]?.toLowerCase();
    const char2 = word2[i]?.toLowerCase();

    if (char1 !== char2) {
      if (char1 && char2) {
        const neighbors = keyboardLayout[char1] || [];
        if (!neighbors.includes(char2)) {
          differences++;
        }
      } else {
        differences++;
      }
    }
  }

  return differences <= Math.max(1, Math.floor(maxLength * 0.3));
}

// Jaro-Winkler similarity for transposition errors
function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2);

  if (jaro < 0.7) return jaro;

  // Calculate common prefix length (up to 4 characters)
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  return jaro + 0.1 * prefix * (1 - jaro);
}

function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3
  );
}

// N-gram similarity for partial matching
function ngramSimilarity(s1: string, s2: string, n: number = 2): number {
  const ngrams1 = getNgrams(s1, n);
  const ngrams2 = getNgrams(s2, n);

  if (ngrams1.length === 0 && ngrams2.length === 0) return 1;
  if (ngrams1.length === 0 || ngrams2.length === 0) return 0;

  const intersection = ngrams1.filter((gram) => ngrams2.includes(gram));
  const union = [...new Set([...ngrams1, ...ngrams2])];

  return intersection.length / union.length;
}

function getNgrams(str: string, n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= str.length - n; i++) {
    ngrams.push(str.substring(i, i + n));
  }
  return ngrams;
}

// Longest Common Subsequence for structural similarity
function longestCommonSubsequence(s1: string, s2: string): number {
  const dp = Array(s1.length + 1)
    .fill(null)
    .map(() => Array(s2.length + 1).fill(0));

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[s1.length][s2.length];
}

// Enhanced Levenshtein distance with weighted operations
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        // Weight different operations differently
        const substitution = matrix[j - 1][i - 1] + 1;
        const insertion = matrix[j - 1][i] + 1;
        const deletion = matrix[j][i - 1] + 1;

        matrix[j][i] = Math.min(substitution, insertion, deletion);

        // Check for transposition (Damerau-Levenshtein)
        if (
          i > 1 &&
          j > 1 &&
          str1[i - 1] === str2[j - 2] &&
          str1[i - 2] === str2[j - 1]
        ) {
          matrix[j][i] = Math.min(matrix[j][i], matrix[j - 2][i - 2] + 1);
        }
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function searchInProduct(product: ProductSearchData, query: string): boolean {
  const normalizedQuery = normalizeString(query);

  // List of searchable fields
  const searchableFields = [
    product.name,
    product.description,
    product.category?.name,
    product.tags,
    product.material,
    product.brand,
  ].filter(Boolean);

  // Add variant fields
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((variant) => {
      if (variant.color) searchableFields.push(variant.color);
      if (variant.size) searchableFields.push(variant.size);
    });
  }

  // First try exact matching (faster)
  for (const field of searchableFields) {
    if (field && normalizeString(field).includes(normalizedQuery)) {
      return true;
    }
  }

  // Then try fuzzy matching for typo tolerance
  for (const field of searchableFields) {
    if (field && fuzzyMatch(field, query)) {
      return true;
    }
  }

  return false;
}

function convertToSearchResult(product: ProductSearchData): SearchResult {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    base_price: product.base_price,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : undefined,
    images: product.images?.map((img: ProductImage) => ({
      url: img.url,
      type: img.type,
    })),
    variants: product.variants?.map((variant: ProductVariant) => ({
      id: variant.id,
      price: variant.price,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    })),
    tags: product.tags,
    material: product.material,
    brand: product.brand,
    featured: product.featured,
  };
}

// Cache duration: 30 seconds (in milliseconds)
// This ensures very fresh data while still avoiding excessive API calls on frequent page reloads
const CACHE_DURATION = 30 * 1000;

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      isInitialized: false,
      lastUpdated: null,
      searchQuery: "",
      filteredResults: [],

      initializeSearchData: async () => {
        const state = get();
        const now = Date.now();

        // Check if we have cached data in localStorage that's still valid
        if (
          state.isInitialized &&
          state.lastUpdated &&
          state.products.length > 0 &&
          now - state.lastUpdated < CACHE_DURATION
        ) {
          console.log(
            "Using cached search data from localStorage - no API call needed"
          );
          console.log(
            `Cached data: ${state.products.length} products, ${state.categories.length} categories`
          );
          return;
        }

        // If we have some cached data but it's expired, log that we're refreshing
        if (state.isInitialized && state.products.length > 0) {
          console.log("Cached data expired, fetching fresh data from API...");
        } else {
          console.log(
            "No cached data found, fetching initial data from API..."
          );
        }

        try {
          const data = await getSearchInitData();

          set({
            products: data.products,
            categories: data.categories,
            isInitialized: true,
            lastUpdated: now,
          });

          console.log(
            `Search data updated: ${data.products.length} products and ${data.categories.length} categories`
          );
          console.log("Data cached to localStorage for future use");
        } catch (error) {
          console.error("Failed to fetch search data from API:", error);

          // If we have any cached data, keep using it even if expired
          if (state.products.length > 0) {
            console.log("API failed, continuing with existing cached data");
          } else {
            console.log("No cached data available and API failed");
          }
        }
      },

      setSearchQuery: (query: string) => {
        const state = get();
        const results = state.searchProducts(query);

        set({
          searchQuery: query,
          filteredResults: results,
        });
      },

      clearSearch: () => {
        set({
          searchQuery: "",
          filteredResults: [],
        });
      },

      searchProducts: (query: string): SearchResult[] => {
        const state = get();

        console.log(`searchProducts called with query: "${query}"`);
        console.log(`Available products: ${state.products.length}`);

        if (!query.trim() || query.length < 2) {
          console.log("Query too short, returning empty results");
          return [];
        }

        // Debug: Test search against first few products
        console.log("Testing search against first 3 products:");
        state.products.slice(0, 3).forEach((product, index) => {
          const matches = searchInProduct(product, query);
          console.log(
            `Product ${index + 1}: "${product.name}" - Matches: ${matches}`
          );
          if (matches) {
            console.log("  Match details:", {
              name: product.name,
              description: product.description,
              category: product.category?.name,
              tags: product.tags,
              material: product.material,
              brand: product.brand,
            });
          }
        });

        const filteredProducts = state.products.filter((product) =>
          searchInProduct(product, query)
        );
        console.log(`Products after filter: ${filteredProducts.length}`);

        const results = filteredProducts
          .map(convertToSearchResult)
          .slice(0, 50); // Limit results to 50 for performance

        console.log(`Search results found: ${results.length}`);
        console.log("First result details:", results[0]);
        return results;
      },

      forceRefresh: async () => {
        set({
          isInitialized: false,
          lastUpdated: null,
        });

        const state = get();
        await state.initializeSearchData();
      },
    }),
    {
      name: "search-store",
      // Only persist the search data, not the search query/results
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        isInitialized: state.isInitialized,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
