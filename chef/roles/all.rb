name "all"
description "Everything in lendsnap"
run_list "recipe[default]", "recipe[users]", "recipe[webserver]", "recipe[railsapp]"
