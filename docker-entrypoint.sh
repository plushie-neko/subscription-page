#!/bin/sh

echo "Starting SvelteKit Subpage entrypoint script..."

# Map APP_PORT to SvelteKit's expected PORT variable
if [ -n "$APP_PORT" ]; then
	echo "Mapping APP_PORT ($APP_PORT) to PORT..."
	export PORT="$APP_PORT"
fi

# Auto-generate INTERNAL_JWT_SECRET if not already set in environment
if [ -z "$INTERNAL_JWT_SECRET" ]; then
	echo "INTERNAL_JWT_SECRET not found in environment. Generating a random secret key..."
	export INTERNAL_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
else
	echo "INTERNAL_JWT_SECRET is already defined in the environment."
fi

# Default ADDRESS_HEADER to X-Forwarded-For if not set, enabling real client IP resolution in @sveltejs/adapter-node
if [ -z "$ADDRESS_HEADER" ]; then
	echo "ADDRESS_HEADER not defined. Defaulting to X-Forwarded-For..."
	export ADDRESS_HEADER="X-Forwarded-For"
fi

if [ -z "$XFF_DEPTH" ]; then
	echo "XFF_DEPTH not defined. Defaulting to 1..."
	export XFF_DEPTH="1"
fi

echo "Entrypoint script completed. Starting SvelteKit server..."
exec "$@"
