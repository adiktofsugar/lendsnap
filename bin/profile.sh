#!/bin/bash
# This should be sourced from the shell context

export LEND_HOME=$(cd `dirname ${BASH_SOURCE[0]}`; cd ..; pwd)
alias cdl="cd \$LEND_HOME"
export PATH=$PATH:$LEND_HOME/bin
