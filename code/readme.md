Code standards
----

- module names are singular
- asynchronous methods have a callback as the last argument
- callback methods always have an error as the first argument. if there is an error, `error instanceof Error` is true
- require everything at the top
- all uris are constructed with jsuri if they have query parameters
