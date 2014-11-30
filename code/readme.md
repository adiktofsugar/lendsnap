JS Code standards
----

- module names are singular
- asynchronous methods have a callback as the last argument
- callback methods always have an error as the first argument. if there is an error, `error instanceof Error` is true
- require everything at the top of each function that needs it.
- modules should not depend on the state of something at the time it is required, except static "config"
- keep scripts below a certain length (100 lines?)
- all uris are constructed with jsuri if they have query parameters
- no nested objects. every object must be flat, and have a service to fetch it

Bash Code Standards
-----

- Only use bash for command delegation. In other words, the last part of a bash script should just be to execute a command in the shell.
- define project_root at the top of the script `project_root=$(cd \`dirname ${BASH_SOURCE[0]}\`; cd up/to/root; pwd)`
