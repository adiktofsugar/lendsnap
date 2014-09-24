class CreateClientAccounts < ActiveRecord::Migration
  def change
    create_table :client_accounts do |t|

      t.timestamps
    end
  end
end
