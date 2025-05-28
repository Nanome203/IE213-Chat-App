# bun-react-tailwind-template

First, install dependencies:

```bash
bun install
```

Then, create .env file and add the database url:

```
DATABASE_URL=
```

Run the following command to generate database schema:

```sh
bun run schema
```

Finally, start a development server with:

```bash
bun run dev
```

Available Routes:

- `localhost:8080/`: Frontend of a test API.
- `localhost:8080/hello`: Frontend of a MVP chat messaging app using WebSocket.

**Example Response:**

```json
{ "message": "API is working!" }
```

This project was created using `bun init` in bun v1.2.14. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
