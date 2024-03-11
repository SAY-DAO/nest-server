#! /bin/bash

STACK=say-staging-nest1
SERVICE=api
CONFIG=$STACK.env
ENV=.env

FULL_SERVICE="${STACK}_${SERVICE}"

docker service update --config-rm $CONFIG $FULL_SERVICE
docker config rm $CONFIG
docker config create $CONFIG $ENV
docker service update $FULL_SERVICE
