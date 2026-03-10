import { evaluate } from "mathjs";
import type { Tool, ToolCall } from "ollama/browser";
import { getOmdbMovie, searchOmdbMovies } from "./omdb";
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

const ollamaWebSearchTool: Tool = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the web using Ollama Cloud (requires OLLAMA API key). Returns search results or an error.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text query to search" },
        maxResults: {
          type: "number",
          description: "Maximum number of search results to return",
        },
      },
      required: ["query"],
    },
  },
};

function getOmdbApiKey() {
  const apiKey = useConfigStore.getState().getOmdbApiKey();
  if (!apiKey) return null;
  return apiKey;
}

declare const HAS_OLLAMA_API_KEY: boolean;

export function getTools() {
  const tools = [getCurrentDateTimeTool, mathCalculateTool];

  if (getOmdbApiKey()) {
    tools.unshift(searchMoviesTool, getMovieTool);
  }

  if (HAS_OLLAMA_API_KEY) {
    tools.push(ollamaWebSearchTool);
  }

  return tools;
}

const toolExecutors: Record<string, (args: any) => Promise<string>> = {
  search_movies: executeSearchMovies,
  get_movie: executeGetMovie,
  get_current_datetime: executeGetCurrentDateTime,
  math_calculate: executeMathCalculate,
  web_search: executeOllamaWebSearch,
};

export async function callTool(tool: ToolCall) {
  const executor = toolExecutors[tool.function.name];
  if (!executor)
    return JSON.stringify({
      error: `No executor found for tool ${tool.function.name}`,
    });

  try {
    console.debug(
      `Executing tool ${tool.function.name} with arguments:`,
      tool.function.arguments,
    );
    const result = await executor(tool.function.arguments);
    console.debug(`Result from tool ${tool.function.name}:`, result);
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

async function executeSearchMovies(args: unknown) {
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
      error: "OMDB_API_KEY is not configured in env variables",
    });
  }

  try {
    const movies = await searchOmdbMovies(apiKey, {
      query,
      type: parsedArgs.type,
      year: parsedArgs.year,
      page: parsedArgs.page,
    });
    return JSON.stringify(movies);
  } catch (err) {
    return JSON.stringify({
      error:
        err instanceof Error ? err.message : "Failed to fetch from OMDB API",
    });
  }
}

async function executeGetMovie(args: unknown) {
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
      error: "OMDB_API_KEY is not configured in env variables",
    });
  }

  try {
    const movie = await getOmdbMovie(apiKey, {
      imdbId,
      title,
      type: parsedArgs.type,
      year: parsedArgs.year,
      plot: parsedArgs.plot,
    });
    return JSON.stringify(movie);
  } catch (err) {
    return JSON.stringify({
      error:
        err instanceof Error ? err.message : "Failed to fetch from OMDB API",
    });
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

async function executeOllamaWebSearch(args: unknown) {
  const parsedArgs = parseArgs<{
    query?: string;
    maxResults?: number;
  }>(args);

  const query = parsedArgs?.query?.trim();
  if (!query)
    return JSON.stringify({ error: "Missing required argument: query" });

  const content = JSON.stringify({
    query,
    max_results: parsedArgs.maxResults ?? 5,
  });

  const response = await fetch(`/api/web_search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: content,
  });
  const data = await response.json();

  return JSON.stringify(data);
}
