json.array!(@client_accounts) do |client_account|
  json.extract! client_account, :id
  json.url client_account_url(client_account, format: :json)
end
