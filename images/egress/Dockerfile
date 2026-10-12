FROM node:24-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20
RUN apt-get update && apt-get install -y --no-install-recommends nftables && rm -rf /var/lib/apt/lists/*
COPY dist /opt/outpost
ENV NODE_ENV=production
ENTRYPOINT ["node", "/opt/outpost/providers/egress/main.js"]
