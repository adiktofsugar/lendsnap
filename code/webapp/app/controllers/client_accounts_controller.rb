class ClientAccountsController < ApplicationController
  before_action :set_client_account, only: [:show, :edit, :update, :destroy]

  # GET /client_accounts
  # GET /client_accounts.json
  def index
    @client_accounts = ClientAccount.all
  end

  # GET /client_accounts/1
  # GET /client_accounts/1.json
  def show
  end

  # GET /client_accounts/new
  def new
    @client_account = ClientAccount.new
  end

  # GET /client_accounts/1/edit
  def edit
  end

  # POST /client_accounts
  # POST /client_accounts.json
  def create
    @client_account = ClientAccount.new(client_account_params)

    respond_to do |format|
      if @client_account.save
        format.html { redirect_to @client_account, notice: 'Client account was successfully created.' }
        format.json { render :show, status: :created, location: @client_account }
      else
        format.html { render :new }
        format.json { render json: @client_account.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /client_accounts/1
  # PATCH/PUT /client_accounts/1.json
  def update
    respond_to do |format|
      if @client_account.update(client_account_params)
        format.html { redirect_to @client_account, notice: 'Client account was successfully updated.' }
        format.json { render :show, status: :ok, location: @client_account }
      else
        format.html { render :edit }
        format.json { render json: @client_account.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /client_accounts/1
  # DELETE /client_accounts/1.json
  def destroy
    @client_account.destroy
    respond_to do |format|
      format.html { redirect_to client_accounts_url, notice: 'Client account was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_client_account
      @client_account = ClientAccount.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def client_account_params
      params[:client_account]
    end
end
