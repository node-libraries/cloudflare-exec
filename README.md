# cloudflare-exec

Running Scripts on Cloudflare Workers

## usage

```text
USAGE
        command [options] <path>
ARGUMENTS
        <path> Path to the script file
OPTIONS
        -r, --remote Run remotely(Default is local)
        -c, --config <path> Path to the wrangler config file(Default is wrangler.toml)
        -e, --env <environment> Environment
        -l, --log <logLevel> "log" | "none" | "info" | "error" | "warn" | "debug"
```

## example

- wrangler.toml

```toml
name = "xxxx"
main = "src/index.ts"
compatibility_date = "2024-03-14"
node_compat = true
minify = true

[[d1_databases]]
binding = "DB"
database_name = "test-db"
database_id ="2c952269-9eb1-4063-8fbe-08a3530925f0"

[env.local]
d1_databases=[
  {binding = "DB",database_name = "test-db",database_id ="test-db"}
]

```

### local execution

```sh
cloudflare-exec --e local prisma/seed
```

### remote execution

```sh
cloudflare-exec -r prisma/seed
```
