#!/usr/bin/env bash
# Create DynamoDB tables expected by custos_app demoData repo (demo/server/repos/demoData.ts).
# Requires: aws CLI v2, credentials with dynamodb:CreateTable + DescribeTable (and usual app perms).
#
# Usage:
#   A) Same shell as Next / keys already exported:
#      export AWS_REGION=us-east-1
#      export AWS_ACCESS_KEY_ID=...
#      export AWS_SECRET_ACCESS_KEY=...
#      ./custos_app/scripts/create-custos-dynamo-tables.sh
#
#   B) Read AWS_* from custos_app/.env.local (does not touch ~/.aws):
#      ./custos_app/scripts/create-custos-dynamo-tables.sh --from-dotenv
#
#   C) Persistent CLI profile:
#      aws configure
#      ./custos_app/scripts/create-custos-dynamo-tables.sh
#
# Optional overrides (defaults match .env.example):
#   CUSTOS_USERS_TABLE CUSTOS_WORKSPACES_TABLE CUSTOS_WALLETS_TABLE
#   CUSTOS_AGENTS_TABLE CUSTOS_TRANSACTIONS_TABLE CUSTOS_VENDORS_TABLE

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOTENV_DEFAULT="$SCRIPT_DIR/../.env.local"

load_aws_from_dotenv() {
  local f="$1"
  if [[ ! -f "$f" ]]; then
    echo "File not found: $f"
    exit 1
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%$'\r'}"
    [[ -z "${line// }" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    case "$line" in
      AWS_ACCESS_KEY_ID=*|AWS_SECRET_ACCESS_KEY=*|AWS_SESSION_TOKEN=*|AWS_REGION=*)
        key="${line%%=*}"
        val="${line#*=}"
        val="${val%\"}"; val="${val#\"}"
        export "${key}=${val}"
        ;;
    esac
  done < "$f"
  echo "Loaded AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (and optional SESSION_TOKEN, REGION) from: $f"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from-dotenv)
      if [[ -n "${2:-}" && "${2:0:1}" != "-" ]]; then
        load_aws_from_dotenv "$2"
        shift 2
      else
        load_aws_from_dotenv "$DOTENV_DEFAULT"
        shift 1
      fi
      ;;
    -h|--help)
      cat <<'EOF'
Usage:
  ./custos_app/scripts/create-custos-dynamo-tables.sh [--from-dotenv [path]]

  --from-dotenv     Load AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (optional SESSION_TOKEN, REGION)
                    from custos_app/.env.local by default.
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1 (try --from-dotenv or --help)"
      exit 1
      ;;
  esac
done

REGION="${AWS_REGION:-us-east-1}"
USERS="${CUSTOS_USERS_TABLE:-custos-users}"
WORKSPACES="${CUSTOS_WORKSPACES_TABLE:-custos-workspaces}"
WALLETS="${CUSTOS_WALLETS_TABLE:-custos-wallets}"
AGENTS="${CUSTOS_AGENTS_TABLE:-custos-agents}"
TRANSACTIONS="${CUSTOS_TRANSACTIONS_TABLE:-custos-transactions}"
VENDORS="${CUSTOS_VENDORS_TABLE:-custos-vendors}"
STRIPE_CREDITS="${CUSTOS_STRIPE_CREDITS_TABLE:-custos-stripe-credits}"

exists() {
  aws dynamodb describe-table --table-name "$1" --region "$REGION" &>/dev/null
}

create_users() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$USERS" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=email,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
      "IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}"
}

create_workspaces() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$WORKSPACES" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
      "IndexName=userId-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL}"
}

create_wallets() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$WALLETS" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=workspaceId,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
      "IndexName=workspaceId-index,KeySchema=[{AttributeName=workspaceId,KeyType=HASH}],Projection={ProjectionType=ALL}"
}

create_agents() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$AGENTS" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=workspaceId,AttributeType=S \
      AttributeName=walletId,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
      "[
        { \"IndexName\": \"workspaceId-index\", \"KeySchema\": [{\"AttributeName\":\"workspaceId\",\"KeyType\":\"HASH\"}], \"Projection\": {\"ProjectionType\":\"ALL\"} },
        { \"IndexName\": \"walletId-index\", \"KeySchema\": [{\"AttributeName\":\"walletId\",\"KeyType\":\"HASH\"}], \"Projection\": {\"ProjectionType\":\"ALL\"} }
      ]"
}

create_transactions() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$TRANSACTIONS" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=workspaceId,AttributeType=S \
      AttributeName=createdAt,AttributeType=S \
      AttributeName=agentId,AttributeType=S \
      AttributeName=walletId,AttributeType=S \
      AttributeName=reviewState,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
      "[
        { \"IndexName\": \"workspaceId-createdAt-index\", \"KeySchema\": [{\"AttributeName\":\"workspaceId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}], \"Projection\": {\"ProjectionType\":\"ALL\"} },
        { \"IndexName\": \"agentId-createdAt-index\", \"KeySchema\": [{\"AttributeName\":\"agentId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}], \"Projection\": {\"ProjectionType\":\"ALL\"} },
        { \"IndexName\": \"walletId-createdAt-index\", \"KeySchema\": [{\"AttributeName\":\"walletId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}], \"Projection\": {\"ProjectionType\":\"ALL\"} },
        { \"IndexName\": \"workspaceId-reviewState-index\", \"KeySchema\": [{\"AttributeName\":\"workspaceId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"reviewState\",\"KeyType\":\"RANGE\"}], \"Projection\": {\"ProjectionType\":\"ALL\"} }
      ]"
}

create_vendors() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$VENDORS" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH
}

create_stripe_credits() {
  aws dynamodb create-table --region "$REGION" \
    --table-name "$STRIPE_CREDITS" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=paymentIntentId,AttributeType=S \
    --key-schema AttributeName=paymentIntentId,KeyType=HASH
}

run_one() {
  local name=$1
  shift
  if exists "$name"; then
    echo "OK — already exists: $name"
    return 0
  fi
  echo "Creating: $name ..."
  "$@"
  echo "Created: $name"
}

echo "Region: $REGION"
aws sts get-caller-identity --region "$REGION" >/dev/null || {
  echo "AWS credentials not configured or invalid (sts get-caller-identity failed)."
  echo "Set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY or use aws configure / IAM role."
  exit 1
}

run_one "$USERS" create_users
run_one "$WORKSPACES" create_workspaces
run_one "$WALLETS" create_wallets
run_one "$AGENTS" create_agents
run_one "$TRANSACTIONS" create_transactions
run_one "$VENDORS" create_vendors
run_one "$STRIPE_CREDITS" create_stripe_credits

echo "Done. Tables: $USERS $WORKSPACES $WALLETS $AGENTS $TRANSACTIONS $VENDORS $STRIPE_CREDITS"
