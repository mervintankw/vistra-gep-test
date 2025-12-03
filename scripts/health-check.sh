#!/bin/bash
# Health Check Script
# Monitors application health and sends alerts

set -e

API_URL="${API_URL:-http://localhost:3000}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
CHECK_INTERVAL="${CHECK_INTERVAL:-30}"
MAX_RETRIES="${MAX_RETRIES:-3}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

send_slack_alert() {
    local message="$1"
    local color="$2"

    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -s -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"text\": \"$message\",
                    \"footer\": \"Health Check\",
                    \"ts\": $(date +%s)
                }]
            }" > /dev/null
    fi
}

check_health() {
    local retries=0
    local healthy=false

    while [ $retries -lt $MAX_RETRIES ]; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")

        if [ "$response" = "200" ]; then
            healthy=true
            break
        fi

        retries=$((retries + 1))
        log_warn "Health check failed (attempt $retries/$MAX_RETRIES) - HTTP $response"
        sleep 5
    done

    if [ "$healthy" = true ]; then
        log_info "Health check passed - API is healthy"
        return 0
    else
        log_error "Health check failed after $MAX_RETRIES attempts"
        send_slack_alert "🚨 Health check failed for $API_URL after $MAX_RETRIES attempts" "danger"
        return 1
    fi
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Check MongoDB
    mongo_health=$(curl -s "$API_URL/health/db" 2>/dev/null || echo "failed")
    if [ "$mongo_health" != "failed" ]; then
        log_info "MongoDB: OK"
    else
        log_warn "MongoDB: Unable to verify"
    fi

    # Check Redis
    redis_health=$(curl -s "$API_URL/health/cache" 2>/dev/null || echo "failed")
    if [ "$redis_health" != "failed" ]; then
        log_info "Redis: OK"
    else
        log_warn "Redis: Unable to verify"
    fi
}

# Main execution
log_info "Starting health check for $API_URL"

if check_health; then
    check_dependencies
    log_info "All checks completed successfully"
    exit 0
else
    log_error "Health check failed"
    exit 1
fi
