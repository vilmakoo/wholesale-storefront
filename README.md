# Wholesale Storefront

A full-stack, serverless wholesale storefront application. This project, built as an assignment for a Full-Stack Developer position, uses a Next.js frontend and an Azure Functions API to serve client-specific pricing and stock levels. The entire cloud infrastructure is managed as code with Terraform. The frontend is hosted on Vercel and the backend API on Azure Function Apps.

The goal of this assignment was to create an application where two different wholesale clients (Client A and Client B) can log in with a unique code and see the same product catalog but with client-specific stock levels and pricing.

### ➡️ [Live Application](https://wholesale-storefront-roan.vercel.app/)


## Running the Project

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
-   [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
-   [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) and an active Azure subscription.

### 1. Local Development

**Clone the repository:**
```bash
git clone https://github.com/vilmakoo/wholesale-storefront.git
cd wholesale-storefront```

**Setup & Run Backend API:**
```bash
cd backend

# Create local settings file
cp local.settings.example.json local.settings.json 
# NOTE: You will need to fill in the client codes in local.settings.json

npm install
func start
```
The API will be running at `http://localhost:7071`.

**Setup & Run Frontend:**
```bash
cd frontend

# Create local environment file
cp .env.example .env.local

npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

### 2. Infrastructure Deployment (Terraform)

The entire cloud infrastructure can be provisioned with Terraform.

```bash
# Navigate to the infrastructure directory
cd infra

# Authenticate with Azure
az login

# Initialize Terraform
terraform init

# Plan and review the deployment
terraform plan

# Apply the plan to create the resources in Azure
terraform apply
```


## Architectural Decisions & Logic

The core logic is in the `GetProducts` Azure Function.
1.  The frontend authenticates using a client code (e.g., `1234`).
2.  The `/Login` API validates this code against environment variables and returns a unique `clientId` (e.g., `client_a`).
3.  The frontend stores this `clientId` in session storage.
4.  When fetching the product catalog, the frontend sends the `clientId` as a query parameter to the `/GetProducts` API (e.g., `.../api/GetProducts?clientId=client_a`).
5.  The `GetProducts` function uses this `clientId` to select and read from the corresponding CSV data file (`client_a_data.csv` or `client_b_data.csv`), ensuring that the correct stock and price information is returned. (The .xls-files provided in the assignment were manually converted into .csv.)

To prevent inefficient file reads on every API call, the `GetProducts` function uses a module-level cache.

All sensitive values (client codes, API keys) are stored as environment variables.

`local.settings.json` is used for local development and is explicitly excluded from Git via `.gitignore`. For the deployed application, secrets are injected as Application Settings via Terraform.

The Terraform state files (`.tfstate`), which contain sensitive output from the cloud provider, are also excluded from Git to prevent credential leaks.


## Example Login Codes

-   Client A Code: `1234`
-   Client B Code: `5678`