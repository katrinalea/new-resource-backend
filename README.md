# Share resource backend
Backend for the share resource app to allow developers to share resources between one another.

## Install

`yarn`

## DB Setup

Copy .env.example to .env and set `DATABASE_URL`, `LOCAL_DATABASE_URL` and `PORT` to your liking.

## Running locally

`yarn start:dev`

The env var LOCAL_DATABASE_URL will be consulted.

## Running locally against a remote db

`yarn start:dev-with-remote-db`

The env var DATABASE_URL will be consulted.

# Deploying to render.com

To deploy to render.com:

-   build command should be `yarn && yarn build`

## Running on render.com

After deployment, render.com should be set up to run either `yarn start` or
`node dist/server.js`

The env var DATABASE_URL will be consulted and so must be set on render.com prior to application start.
