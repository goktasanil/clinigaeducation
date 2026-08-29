FROM eclipse-temurin:17-jre-jammy

ARG MICROMAMBA_VERSION=2.9.0-0
ARG MICROMAMBA_SHA256=366cd9cd8be14df1ab8ed50352a82111082a36686b2d389fdb79a92c3fafb3e3
ARG NEXTFLOW_VERSION=26.04.6
ARG NEXTFLOW_SHA256=61a755edbed743cfbb568f3a6c67af68481a2f6a4d6dffcc4295e51318968281
ARG NFCORE_RNASEQ_SHA=1f03b53ef799e298f60c813440e961e867017043

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git bzip2 \
    && rm -rf /var/lib/apt/lists/*

# mamba-org/micromamba-releases: checksum-pinned binary.
RUN curl -fsSL -o /usr/local/bin/micromamba \
      "https://github.com/mamba-org/micromamba-releases/releases/download/${MICROMAMBA_VERSION}/micromamba-linux-64" \
    && echo "${MICROMAMBA_SHA256}  /usr/local/bin/micromamba" | sha256sum -c - \
    && chmod 0755 /usr/local/bin/micromamba

# nextflow-io/nextflow: checksum-pinned release launcher.
RUN curl -fsSL -o /usr/local/bin/nextflow \
      "https://github.com/nextflow-io/nextflow/releases/download/v${NEXTFLOW_VERSION}/nextflow" \
    && echo "${NEXTFLOW_SHA256}  /usr/local/bin/nextflow" | sha256sum -c - \
    && chmod 0755 /usr/local/bin/nextflow

# nf-core/rnaseq: immutable source snapshot for controlled execution.
RUN git clone --filter=blob:none https://github.com/nf-core/rnaseq.git /opt/nf-core-rnaseq \
    && cd /opt/nf-core-rnaseq \
    && git fetch --depth 1 origin "${NFCORE_RNASEQ_SHA}" \
    && git checkout --detach "${NFCORE_RNASEQ_SHA}" \
    && rm -rf .git

WORKDIR /work
ENV NXF_HOME=/work/.nextflow
CMD ["nextflow", "-version"]
