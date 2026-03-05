import type { Tool, ToolCall } from "ollama/browser";
import { evaluate } from "mathjs";
import { useConfigStore } from "../store/configStore";

const searchMoviesTool: Tool = {
  type: "function",
  function: {
    name: "search_movies",
    description:
      "Search movies with a text search and return a list of results " +
      "and optional type, year and page parameters. Returning a list of matching movies.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Title text to search",
        },
        type: {
          type: "string",
          description: "Optional type filter: movie, series, episode",
        },
        year: {
          type: "string",
          description: "Optional release year",
        },
        page: {
          type: "number",
          description: "Optional result page from 1 to 100",
        },
      },
      required: ["query"],
    },
  },
};

const getMovieTool: Tool = {
  type: "function",
  function: {
    name: "get_movie",
    description:
      "Get a single movie/series/episode by IMDb ID (i) or exact title (t)",
    parameters: {
      type: "object",
      properties: {
        imdb_id: {
          type: "string",
          description: "IMDb ID like tt0111161",
        },
        title: {
          type: "string",
          description: "Title to search, e.g. The Shawshank Redemption",
        },
        type: {
          type: "string",
          description: "Optional type filter: movie, series, episode",
        },
        year: {
          type: "string",
          description: "Optional release year",
        },
        plot: {
          type: "string",
          description: "Optional plot size: short or full",
        },
      },
    },
  },
};

const getCurrentDateTimeTool: Tool = {
  type: "function",
  function: {
    name: "get_current_datetime",
    description:
      "Get the user's current date/time and browser timezone information",
  },
};

const mathCalculateTool: Tool = {
  type: "function",
  function: {
    name: "math_calculate",
    description:
      "Evaluate a mathematical expression and return the numeric result. Uses mathjs syntax, e.g. (2 + 3) * 4 or sqrt(81)",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "Mathematical expression to evaluate, e.g. (2 + 3) * 4 or sqrt(81)",
        },
      },
      required: ["expression"],
    },
  },
};

export const tools = [
  getCurrentDateTimeTool,
  mathCalculateTool,
  searchMoviesTool,
  getMovieTool,
];

const toolExecutors: Record<string, (args: unknown) => Promise<string>> = {
  search_movies: executeSearchMovies,
  get_movie: executeGetMovie,
  get_current_datetime: executeGetCurrentDateTime,
  math_calculate: executeMathCalculate,
};

export async function callTool(tool: ToolCall) {
  const executor = toolExecutors[tool.function.name];
  if (!executor)
    return JSON.stringify({
      error: `No executor found for tool ${tool.function.name}`,
    });

  try {
    console.log(
      `Executing tool ${tool.function.name} with arguments:`,
      tool.function.arguments,
    );
    const result = await executor(tool.function.arguments);
    console.log(`Result from tool ${tool.function.name}:`, result);
    return result;
  } catch (err) {
    return JSON.stringify({
      error: err instanceof Error ? err.message : "Tool execution failed",
    });
  }
}

function parseArgs<T>(args: unknown): T {
  if (typeof args === "string") {
    return JSON.parse(args) as T;
  }
  return args as T;
}

function appendOptional(url: URL, key: string, value?: string | number) {
  if (value === undefined || value === null) return;
  const text = String(value).trim();
  if (!text) return;
  url.searchParams.set(key, text);
}

function getOmdbApiKey() {
  const apiKey = useConfigStore.getState().getOmdbApiKey();
  if (!apiKey) return null;
  return apiKey;
}

export async function executeSearchMovies(args: unknown) {
  const parsedArgs = parseArgs<{
    query?: string;
    type?: string;
    year?: string;
    page?: number;
  }>(args);

  const query = parsedArgs?.query?.trim();
  if (!query) {
    return JSON.stringify({ error: "Missing required argument: query" });
  }

  const apiKey = getOmdbApiKey();
  if (!apiKey) {
    return JSON.stringify({
      error: "VITE_OMDB_API_KEY is not configured in env variables",
    });
  }

  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("s", query);
    appendOptional(url, "type", parsedArgs.type);
    appendOptional(url, "y", parsedArgs.year);
    appendOptional(url, "page", parsedArgs.page);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.Response === "True") {
      return JSON.stringify(data.Search ?? []);
    }

    return JSON.stringify({ error: data.Error ?? "OMDB search failed" });
  } catch {
    return JSON.stringify({ error: "Failed to fetch from OMDB API" });
  }
}

export async function executeGetMovie(args: unknown) {
  const parsedArgs = parseArgs<{
    imdb_id?: string;
    title?: string;
    type?: string;
    year?: string;
    plot?: string;
  }>(args);

  const imdbId = parsedArgs?.imdb_id?.trim();
  const title = parsedArgs?.title?.trim();
  if (!imdbId && !title) {
    return JSON.stringify({
      error: "Missing required argument: imdb_id or title",
    });
  }

  const apiKey = getOmdbApiKey();
  if (!apiKey) {
    return JSON.stringify({
      error: "VITE_OMDB_API_KEY is not configured in env variables",
    });
  }

  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", apiKey);
    if (imdbId) {
      url.searchParams.set("i", imdbId);
    } else if (title) {
      url.searchParams.set("t", title);
    }

    appendOptional(url, "type", parsedArgs.type);
    appendOptional(url, "y", parsedArgs.year);
    appendOptional(url, "plot", parsedArgs.plot);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.Response === "True") {
      return JSON.stringify(data);
    }

    return JSON.stringify({ error: data.Error ?? "OMDB lookup failed" });
  } catch {
    return JSON.stringify({ error: "Failed to fetch from OMDB API" });
  }
}

async function executeGetCurrentDateTime() {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffsetMinutes = -now.getTimezoneOffset();

  return JSON.stringify({
    now_iso: now.toISOString(),
    now_local: now.toString(),
    locale: navigator.language,
    timezone,
    timezone_offset_minutes: timezoneOffsetMinutes,
  });
}

async function executeMathCalculate(args: unknown) {
  const parsedArgs = parseArgs<{ expression?: string }>(args);
  const expression = parsedArgs?.expression?.trim();

  if (!expression) {
    return JSON.stringify({ error: "Missing required argument: expression" });
  }

  try {
    const result = evaluate(expression);
    return JSON.stringify({ expression, result });
  } catch (err) {
    return JSON.stringify({
      error:
        err instanceof Error ? err.message : "Invalid mathematical expression",
    });
  }
}
