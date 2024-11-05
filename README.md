# Ultimate Nest.js Boilerplate ⚡

## Tech 🖥️

- [x] Fastify
- [x] NestJS
- [x] Postgres
- [x] TypeORM
- [x] Offset and Cursor based pagination support
- [x] REST & Graphql API
- [x] Swagger and API versioning for REST API
- [x] BullMQ for queue
- [x] Caching using Redis
- [x] Pino for logging
- [x] Rate Limiter using Redis
- [x] Graceful Shutdown
- [x] Testing with Jest
- [x] pnpm
- [x] Docker
- [x] Github Actions
- [x] Commitlint & Husky
- [x] SWC instead of Webpack

## Additional Features 📦:

### 1. Dependency Graph 📈

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

### 2. Database ERD 🛢️

Visualize your database entities and their relationships.

```
pnpm erd:generate
```

<figure>
<img src="./github-assets/erd.png" style="border: 5px solid teal; height: 1080px;" />
<figcaption style="text-align: center; font-style: italic;">Sample ERD</figcaption>
</figure>

Extended from [nestjs-boilerplate](https://github.com/vndevteam/nestjs-boilerplate?tab=readme-ov-file)
