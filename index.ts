#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

const WEB_SEARCH_TOOL: Tool = {
  name: "searxng_web_search",
  description:
    "Performs a web search using the SearxNG API, ideal for general queries, news, articles, and online content. " +
    "Use this for broad information gathering, recent events, or when you need diverse web sources.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query",
      },
      count: {
        type: "number",
        description: "Number of results",
        default: 20,
      },
      offset: {
        type: "number",
        description: "Pagination offset",
        default: 0,
      },
    },
    required: ["query"],
  },
};

// Server implementation
const server = new Server(
  {
    name: "example-servers/searxng-search",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

interface SearxNGWeb {
  results: Array<{
    title: string;
    content: string;
    url: string;
  }>;
}

function isSearxNGWebSearchArgs(
  args: unknown
): args is { query: string; count?: number } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

async function performWebSearch(
  query: string,
  count: number = 10,
  offset: number = 0
) {
  const searxngUrl = process.env.SEARXNG_URL || "http://localhost:8080";
  const url = new URL(`${searxngUrl}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("start", offset.toString());
  url.searchParams.set("count", count.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      `SearxNG API error: ${response.status} ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  const data = (await response.json()) as SearxNGWeb;

  const results = (data.results || []).map((result) => ({
    title: result.title || "",
    content: result.content || "",
    url: result.url || "",
  }));

  return results
    .map((r) => `Title: ${r.title}\nDescription: ${r.content}\nURL: ${r.url}`)
    .join("\n\n");
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [WEB_SEARCH_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "searxng_web_search") {
      if (!isSearxNGWebSearchArgs(args)) {
        throw new Error("Invalid arguments for searxng_web_search");
      }
      const { query, count = 10 } = args;
      const results = await performWebSearch(query, count);
      return {
        content: [{ type: "text", text: results }],
        isError: false,
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SearxNG MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});