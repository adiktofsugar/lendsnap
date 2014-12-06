#!/bin/bash
# This should be sourced from the shell context

export LEND_HOME=$(cd `dirname ${BASH_SOURCE[0]}`; cd ..; pwd)
alias cdl="cd \$LEND_HOME"
export PATH=$PATH:$LEND_HOME/bin

_lendcommand () {
    local word=${COMP_WORDS[COMP_CWORD]}
    commands=`lendcommand`
    COMPREPLY=($(compgen -W "$(lendcommand)" -- "$word"))
}
complete -F _lendcommand -o filenames lendcommand

_lendplay () {
    local word=${COMP_WORDS[COMP_CWORD]}
    COMPREPLY=($(compgen -W "$(lendplay)" -- "$word"))
}
complete -F _lendplay -o filenames lendplay
