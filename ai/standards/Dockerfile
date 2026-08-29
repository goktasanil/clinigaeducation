FROM rocker/r-ver:4.5.1

ARG ADMIRAL_SHA=e32e5689d7fd03e224ddbcfc369c332c5df837d9
ARG SDTM_OAK_SHA=6b5d887aa560c77b3ec983071489725e3046ce1e
ARG OMOP_CDM_SHA=4a910305b2cb74a4fc2b2c34baf44eb0542ff03f

RUN apt-get update \
    && apt-get install -y --no-install-recommends git libcurl4-openssl-dev libssl-dev libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

RUN R -q -e "install.packages('pak', repos='https://cloud.r-project.org')" \
    && R -q -e "pak::pkg_install(sprintf('pharmaverse/admiral@%s', Sys.getenv('ADMIRAL_SHA', '${ADMIRAL_SHA}')))" \
    && R -q -e "pak::pkg_install(sprintf('pharmaverse/sdtm.oak@%s', Sys.getenv('SDTM_OAK_SHA', '${SDTM_OAK_SHA}')))"

RUN git clone --filter=blob:none https://github.com/OHDSI/CommonDataModel.git /opt/omop-cdm \
    && cd /opt/omop-cdm \
    && git fetch --depth 1 origin "${OMOP_CDM_SHA}" \
    && git checkout --detach "${OMOP_CDM_SHA}" \
    && rm -rf .git

WORKDIR /work
CMD ["R", "-q", "-e", "cat('admiral=', as.character(packageVersion('admiral')), ' sdtm.oak=', as.character(packageVersion('sdtm.oak')), '\\n')"]
