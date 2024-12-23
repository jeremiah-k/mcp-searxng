# SearxNG MCP Server

An MCP server implementation that integrates the SearxNG API, providing web search capabilities.

## Features

- **Web Search**: General queries, news, articles, with pagination.
- **Pagination**: Control return size and result counts with filtering options.

## Tools

- **searxng_web_search**
  - Execute web searches with pagination and filtering
  - Inputs:
    - `query` (string): Search terms
    - `count` (number, optional): Results per page (default 20)
    - `offset` (number, optional): Pagination offset (default 0)

## Configuration

### Setting the SEARXNG_URL

1. Choose a SearxNG instance from the [list of public instances](https://searx.space/) or to your local environment.
2. Set the `SEARXNG_URL` environment variable to the instance URL.
3. The default `SEARXNG_URL` value is `http://localhost:8080`

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "SEARXNG_URL",
        "mcp-server-searxng:latest"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

### Usage with VSCode

Add this to your `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "searxng": {
      "command": "npx",
      "args": [
        "-y"
        "<full path to mcp-searxng repo>/index.js"
      ],
      "env": {
        "SEARXNG_URL": "YOUR_SEARXNG_INSTANCE_URL"
      }
    }
  }
}
```

## Build

Docker build:

```bash
docker build -t mcp-server-searxng:latest -f Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.