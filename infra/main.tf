terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  description = "A unique name for the resource group."
  type        = string
  default     = "rg-wholesale-storefront-dev"
}

variable "location" {
  description = "The Azure region where resources will be deployed."
  type        = string
  default     = "North Europe"
}

variable "app_name" {
  description = "A unique name for the application resources."
  type        = string
  default     = "wsstoreappvilmakoo1"
}

variable "frontend_url" {
  description = "The public URL of the deployed frontend application (for CORS)."
  type        = string
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_storage_account" "main" {
  name                     = "${var.app_name}sa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "Y1"
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-logworkspace"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-appinsights"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.main.id 
}

resource "azurerm_linux_function_app" "main" {
  name                       = "${var.app_name}-api"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  service_plan_id            = azurerm_service_plan.main.id
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key

  site_config {
    application_stack {
      node_version = "18"
    }

    cors {
      allowed_origins     = [var.frontend_url]
      support_credentials = true
    }
  }

  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" : "node",
    "CLIENT_A_CODE" : "1234",
    "CLIENT_B_CODE" : "5678",
    "APPINSIGHTS_INSTRUMENTATIONKEY": azurerm_application_insights.main.instrumentation_key
  }
}

output "function_app_hostname" {
  value = "https://${azurerm_linux_function_app.main.default_hostname}"
}