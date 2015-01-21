Lendsnap
=====

Setup:
 - Install vagrant
 - Install virtualbox
Run `vagrant up`;
Run `vagrant ssh core-01`; `/var/lendsnap-repo/install`; `sudo systemctl start web-ui`
Run `vagrant ssh core-02`; `/var/lendsnap-repo/install`; `sudo systemctl start db`

Spec: https://drive.google.com/open?id=1UEGZj9TWp1thlY5ItUdeCVzZOVloC-nxbebRD9EJUgw

JS Code standards
----

- module names are singular
- asynchronous methods have a callback as the last argument
- callback methods always have an error as the first argument. if there is an error, `error instanceof Error` is true
- service methods should be as specific as possible.
    - aka getUserById isntead of getUser
    - signature of getUserById(id[,options],callback)
    - callback will always be at the end, and if there are options, they will be before the callback
    - this style encourages writing specific service methods
- require everything at the top of each function that needs it.
- modules should not depend on the state of something at the time it is required, except static "config"
- keep scripts below a certain length (100 lines?)
- all uris are constructed with jsuri if they have query parameters
- no nested objects. every object must be flat, and have a service to fetch it

Bash Code Standards
-----

- No -h option. bash scripts should be small enough to `cat` and comprehend
- Only use bash for command delegation. In other words, the last part of a bash script should just be to execute a command in the shell.
- if anything requires paths, do it relative to project root. define project_root at the top of the script `project_root=$(cd \`dirname ${BASH_SOURCE[0]}\`; cd up/to/root; pwd)`
- if options make sense, use getopts. http://wiki.bash-hackers.org/howto/getopts_tutorial
````
dev_mode=false
while getopts ":r:n:d" opt; do
    case "$opt" in
        r) root_pass=$OPTARG;;
        n) db_name=$OPTARG;;
        d) dev_mode=true
        \?) echo "option -$OPTARG not supported"; exit 1;;
        :) echo "option -$OPTARG requires an argument"; exit 1;;
    esac
    shift
done
````
