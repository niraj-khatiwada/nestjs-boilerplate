# Ultimate Nest.js Boilerplate ⚡

## Features📦

- [x] Fastify
- [x] NestJS
- [x] Postgres
- [x] TypeORM
- [x] Offset and Cursor based Pagination
- [x] REST & GraphQL API
- [x] Swagger Documentation and API versioning for REST API
- [x] Automatic API generation on the frontend using OpenAPI Codegen [Learn More](#1-automatic-api-generation-on-the-frontend)
- [x] Websocket
- [x] BullMQ for Queues
- [x] Caching using Redis
- [x] Pino for Logging
- [x] Rate Limiter using Redis for both REST & GraphQL
- [x] Graceful Shutdown
- [x] File Uploads
- [x] Sentry
- [x] Testing with Jest
- [x] pnpm
- [x] Docker
- [x] Github Actions
- [x] Commitlint & Husky
- [x] SWC instead of Webpack
- [x] Dependency Graph Visualizer [Learn More](#2-dependency-graph-)
- [x] Database Entity Relationship Diagram Generator [Learn More](#3-database-entity-relationship-diagram️)

### 1. Automatic API generation on the Frontend🚀

You can automatically generate and use all of your backend API in frontend in just one command, thanks to Swagger and OpenAPI spec. Running `pnpm codegen` on the frontend (example [repo](https://github.com/niraj-khatiwada/openapi-codegen)) will automatically generate all API's bootstrapped with [Tanstack Query](https://tanstack.com/query/latest) ready to be used with just one import. See complete example [here](https://github.com/niraj-khatiwada/openapi-codegen)
<img src="./github-assets/openapi-codegen.png" style="border: 5px solid teal;" />

### 2. Dependency Graph 📈

Visualize all of your project modules and their dependencies. Also, detect circular dependencies.

NOTE: Make sure [Graphviz](https://www.graphviz.org/) is installed first.

- All dependencies:

```
pnpm graph:app
```

- Only circular dependencies:

```
pnpm graph:circular
```

<figure>
<img src="./github-assets/graph.png" style="border: 5px solid teal" />
<figcaption style="text-align: center; font-style: italic;">Sample Graph</figcaption>
</figure>

### 3. Database Entity Relationship Diagram🛢️

Visualize your database entities and their relationships.

```
pnpm erd:generate
```

<figure>
<img src="./github-assets/erd.png" style="border: 5px solid teal; height: 1080px;" />
<figcaption style="text-align: center; font-style: italic;">Sample ERD</figcaption>
</figure>

Extended from [nestjs-boilerplate](https://github.com/vndevteam/nestjs-boilerplate?tab=readme-ov-file)
