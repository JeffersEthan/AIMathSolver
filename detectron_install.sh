#!/bin/bash

conda create --name detectron2_training_env python=3.10

conda activate detectron2_training_env

python -m pip install 'git+https://github.com/facebookresearch/detectron2.git'

pip install torchvision==0.16.0

pip install torch==1.10

conda install -c anaconda ipykernel

python -m ipykernel install --user --name=detectron2_kernel








