FROM python:3.11-slim

ARG BIOMED_AGENT_SHA=c74911cb31437f2669f4a1fd03176911545f773f

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends git build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --filter=blob:none https://github.com/JINGEWU/BioMedAgent.git /opt/biomed-agent \
    && cd /opt/biomed-agent \
    && git fetch --depth 1 origin "${BIOMED_AGENT_SHA}" \
    && git checkout --detach "${BIOMED_AGENT_SHA}" \
    && pip install -r requirements.txt \
    && rm -rf .git

WORKDIR /opt/biomed-agent
# No external API keys are baked into the image. Runtime credentials, if ever
# supplied, remain deployment secrets and are not exposed to the general agent.
CMD ["python", "-c", "import agent; print('BioMedAgent runtime ready')"]
