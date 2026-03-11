FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends sqlite3 openssl ca-certificates \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*
