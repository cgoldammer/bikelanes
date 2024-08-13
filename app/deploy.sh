#!/bin/bash

npm run buildPublic
rsync -r serve_content/ homepage:~/others/bikelanes