terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Estado remoto en S3: el runner de GitHub Actions se borra después de cada
  # ejecución, así que el estado NO puede quedarse en local.
  # El bucket se pasa en el workflow con -backend-config="bucket=..."
  backend "s3" {
    key          = "api-lamar/terraform.tfstate"
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "Terraform"
    }
  }
}
