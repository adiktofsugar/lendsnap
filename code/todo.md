deployment
----
i need a "commit docker image" step so that the coreos instances can all pull it
ansible should use the etcd coreos service to communicate between them i guess?
I think the process is
- commit docker instances
- set up core os group and assign roles to each one
- ansible commands basically just make the hosts pull a docker image and run commands on it

auth
---
Cookies just hold access_token
access_token is for protected resources
Requests that are protected check access_token in this order:
    - body
    - query
    - cookie
access_token has the following attributes:
    - user id
    - scope
    - ttl
"/log-in" will set the access_token. its asking for scope of "login" and/or "user_resources"
"/auth/authorize" can be passed more permissions
"/auth/refresh" will increase the ttl

I'm not doing oauth, and especially not with the node-oath20-provider. It seems to be more designed for a separate auth server with multiple clients and that's just too complicated for me right now.
