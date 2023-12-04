FROM ubuntu:latest
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa -y && \
    apt-get install -y python3.8 python3-pip git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3.8 /usr/bin/python

# Install Miniconda
RUN apt-get update && \
    apt-get install -y curl && \
    curl -O https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    bash Miniconda3-latest-Linux-x86_64.sh -b -p /opt/conda && \
    rm Miniconda3-latest-Linux-x86_64.sh && \
    apt-get install -y libgl1-mesa-glx

ENV PATH="/opt/conda/bin:${PATH}"
RUN mkdir /home/detectronuser/
WORKDIR /home/detectronuser/
COPY env.yml env.yml
RUN conda env create -f env.yml --name=local_detectron #create the enviornment
RUN . /opt/conda/etc/profile.d/conda.sh && \
    conda activate local_detectron && \
    git clone https://github.com/facebookresearch/detectron2.git && \
    python -m pip install -e detectron2

