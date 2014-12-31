Account service
----

Responsible for accounts. Data associated with them, permissions, authentication

The reasoning is that they are linked. You can't auth without an account, so the same service should create/update/delete accounts, as well as auth them.

Functions
----
get/create/update/delete
authenticate - can they login/do banker things/do admin things etc.

Account models (simple)
----
(Int) id
(String) first name
(string) last name
(Array) permissions Ex. ["login", "banker"]
