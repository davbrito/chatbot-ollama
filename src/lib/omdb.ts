export interface OmdbMovieSummary {
  Title: string;
  Year: string;
  Type: string;
  imdbID: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Search?: OmdbMovieSummary[];
  Response: "True" | "False";
  Error?: string;
}

export interface OmdbMovieDetail {
  [key: string]: unknown;
  Response: "True" | "False";
  Error?: string;
}

function appendOptional(url: URL, key: string, value?: string | number) {
  if (value === undefined || value === null) return;
  const text = String(value).trim();
  if (!text) return;
  url.searchParams.set(key, text);
}

function assertApiKey(apiKey: string) {
  if (!apiKey.trim()) {
    throw new Error("OMDb API key is required");
  }
}

export async function searchOmdbMovies(
  apiKey: string,
  params: {
    query: string;
    type?: string;
    year?: string;
    page?: number;
    signal?: AbortSignal;
  },
): Promise<OmdbMovieSummary[]> {
  assertApiKey(apiKey);

  const query = params.query.trim();
  if (!query) {
    throw new Error("Missing required argument: query");
  }

  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", apiKey.trim());
  url.searchParams.set("s", query);
  appendOptional(url, "type", params.type);
  appendOptional(url, "y", params.year);
  appendOptional(url, "page", params.page);

  const response = await fetch(url.toString(), {
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from OMDb API");
  }

  const data = (await response.json()) as OmdbSearchResponse;
  if (data.Response !== "True") {
    throw new Error(data.Error ?? "OMDb search failed");
  }

  return data.Search ?? [];
}

export async function getOmdbMovie(
  apiKey: string,
  params: {
    imdbId?: string;
    title?: string;
    type?: string;
    year?: string;
    plot?: string;
    signal?: AbortSignal;
  },
): Promise<OmdbMovieDetail> {
  assertApiKey(apiKey);

  const imdbId = params.imdbId?.trim();
  const title = params.title?.trim();
  if (!imdbId && !title) {
    throw new Error("Missing required argument: imdb_id or title");
  }

  const url = new URL("https://www.omdbapi.com/");
  url.searchParams.set("apikey", apiKey.trim());

  if (imdbId) {
    url.searchParams.set("i", imdbId);
  } else if (title) {
    url.searchParams.set("t", title);
  }

  appendOptional(url, "type", params.type);
  appendOptional(url, "y", params.year);
  appendOptional(url, "plot", params.plot);

  const response = await fetch(url.toString(), {
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from OMDb API");
  }

  const data = (await response.json()) as OmdbMovieDetail;
  if (data.Response !== "True") {
    throw new Error((data.Error as string) || "OMDb lookup failed");
  }

  return data;
}
