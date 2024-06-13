#!/bin/bash

# Generate JavaScript code
pnpm grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:. \
    --grpc_out=. \
    --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
    ./src/protobufs/users-management-service/*.proto

# Generate TypeScript code (d.ts)
pnpm grpc_tools_node_protoc \
    --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
    --ts_out=. \
    ./src/protobufs/users-management-service/*.proto
