#!/bin/sh
/bin/bash -c 'cd /var/lendsnap/node && npm install'
/bin/bash -c 'cd /var/lendsnap/node && forever -w app.js'
