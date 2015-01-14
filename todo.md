- Get smb shares working properly on windows. Right now I have to manually scp the mount.cifs file i built and share and connect and all that...every time i build the machine. I could also make a service to do it all automatically based on metadata...hmm...

- conditional rebuild for services
    if already built, don't build, otherwise build the thing. but...always build the first time? or maybe a service to build that the normal service requires

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
