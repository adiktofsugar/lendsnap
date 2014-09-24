require 'test_helper'

class ClientAccountsControllerTest < ActionController::TestCase
  setup do
    @client_account = client_accounts(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:client_accounts)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create client_account" do
    assert_difference('ClientAccount.count') do
      post :create, client_account: {  }
    end

    assert_redirected_to client_account_path(assigns(:client_account))
  end

  test "should show client_account" do
    get :show, id: @client_account
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @client_account
    assert_response :success
  end

  test "should update client_account" do
    patch :update, id: @client_account, client_account: {  }
    assert_redirected_to client_account_path(assigns(:client_account))
  end

  test "should destroy client_account" do
    assert_difference('ClientAccount.count', -1) do
      delete :destroy, id: @client_account
    end

    assert_redirected_to client_accounts_path
  end
end
