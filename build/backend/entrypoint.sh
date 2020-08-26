#!/bin/bash
if [ -f "/app/config/entrypoint.sh" ]; then
	echo Running custom entrypoint script!
	/app/config/entrypoint.sh
fi

exec "$@"
