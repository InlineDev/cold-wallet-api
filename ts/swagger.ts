const statusCode200 = (data) => {
  return {
    200: {
      description: "A successful response.",
      content: {
        "application/json": {
          example: {
            status: "OK",
            data,
            error: {}
          }
        }
      }
    },
  }
};

const statusCode400 = {
  400: {
    description: "An unexpected error response.",
    content: {
      "application/json": {
        example: {
          status: "error",
          data: {},
          error: {
            message: "Your error message here."
          }
        }
      }
    }
  }
};

const swaggerJson = {
  openapi: "3.0.0",
  info: {
    title: "Express API with Swagger",
    version: "1.0.0"
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/v1/auth/login": {
      get: {
        summary: "Login",
        parameters: [{
          name: "mnemonic",
          in: "query",
          description: "mnemonic encrypted AES and base64",
          required: true,
          schema: {
            type: "string"
          }
        },],
        responses: {
          ...statusCode200({ token: "token" }),
          ...statusCode400,
        }
      }
    },
    "/v1/auth/registration": {
      post: {
        summary: "Registration",
        responses: {
          ...statusCode200({ mnemonic: "mnemonic encrypted in AES" }),
          ...statusCode400,
        }
      }
    },
    "/v1/balance/balance": {
      get: {
        summary: "Balance",
        description: "Requires authorization!",
        security: [
          {
            BearerAuth: []
          }
        ],
        responses: {
          ...statusCode200({
            data: [
              {
                coi: "BTC",
                status: true,
                amount: 0,
                amountCommission: 0.01,
                network: "BTC",
                minimumAmountReplenishment: 1,
                minimumWithdrawalAmount: 1,
                coinComission: "btc",
                priceToUsd: 0.999753,
                priceBalanceInCurrency: {
                  usd: 0,
                  rub: 0,
                  eur: 0
                },
                priceInCurrency: {
                  usd: 0.999753,
                  rub: 89.3,
                  eur: 0.922072
                }
              }
            ],
            dataCurrencyList: [
              {
                name: "usd",
                symbol: "$"
              },
            ]
          }),
          ...statusCode400,
        }
      }
    }
  }
};

export default swaggerJson;