#!/bin/bash
# Mock Git History Generator for LinearB Testing
# Generates 6 months of realistic activity across 5 contributors

set -e

# Configuration
REPO_DIR="/Users/mervintan/Vistra/source_codes/vistra-gep-test"
START_DATE="2025-08-01"
END_DATE="2026-01-31"

# 5 Contributors with different profiles
declare -A CONTRIBUTORS
CONTRIBUTORS=(
    ["alice"]="Alice Chen|alice.chen@vistra.com|senior|backend"
    ["bob"]="Bob Martinez|bob.martinez@vistra.com|mid|fullstack"
    ["charlie"]="Charlie Wong|charlie.wong@vistra.com|junior|frontend"
    ["diana"]="Diana Patel|diana.patel@vistra.com|senior|devops"
    ["evan"]="Evan Kim|evan.kim@vistra.com|mid|backend"
)

# Commit message templates by type
FEATURE_MSGS=(
    "feat: implement %s functionality"
    "feat: add %s feature"
    "feat(%s): new implementation"
    "feat: create %s module"
    "feat: introduce %s capabilities"
)

BUGFIX_MSGS=(
    "fix: resolve %s issue"
    "fix: correct %s behavior"
    "fix(%s): handle edge case"
    "fix: patch %s vulnerability"
    "fix: address %s bug"
)

REFACTOR_MSGS=(
    "refactor: improve %s structure"
    "refactor: optimize %s performance"
    "refactor(%s): clean up code"
    "refactor: simplify %s logic"
    "chore: update %s dependencies"
)

DOCS_MSGS=(
    "docs: update %s documentation"
    "docs: add %s examples"
    "docs(%s): improve README"
    "docs: document %s API"
)

TEST_MSGS=(
    "test: add %s unit tests"
    "test: improve %s coverage"
    "test(%s): add integration tests"
    "test: fix flaky %s tests"
)

# Feature names for realistic commits
FEATURES=(
    "authentication" "user-management" "dashboard" "reporting"
    "notifications" "search" "filtering" "pagination"
    "caching" "logging" "monitoring" "api-gateway"
    "database-migration" "file-upload" "export" "import"
    "validation" "error-handling" "rate-limiting" "webhooks"
    "email-service" "queue-processing" "scheduling" "analytics"
)

cd "$REPO_DIR"

echo "Starting mock history generation..."
echo "Contributors: ${!CONTRIBUTORS[@]}"

# Function to get random element from array
random_element() {
    local arr=("$@")
    echo "${arr[$RANDOM % ${#arr[@]}]}"
}

# Function to generate random date between start and end
random_date() {
    local start_ts=$(date -j -f "%Y-%m-%d" "$START_DATE" "+%s")
    local end_ts=$(date -j -f "%Y-%m-%d" "$END_DATE" "+%s")
    local random_ts=$((start_ts + RANDOM % (end_ts - start_ts)))
    date -j -f "%s" "$random_ts" "+%Y-%m-%d %H:%M:%S"
}

# Function to create a commit with specific author and date
make_commit() {
    local author_name="$1"
    local author_email="$2"
    local commit_date="$3"
    local message="$4"

    GIT_AUTHOR_NAME="$author_name" \
    GIT_AUTHOR_EMAIL="$author_email" \
    GIT_AUTHOR_DATE="$commit_date" \
    GIT_COMMITTER_NAME="$author_name" \
    GIT_COMMITTER_EMAIL="$author_email" \
    GIT_COMMITTER_DATE="$commit_date" \
    git commit -m "$message" --allow-empty 2>/dev/null || \
    GIT_AUTHOR_NAME="$author_name" \
    GIT_AUTHOR_EMAIL="$author_email" \
    GIT_AUTHOR_DATE="$commit_date" \
    GIT_COMMITTER_NAME="$author_name" \
    GIT_COMMITTER_EMAIL="$author_email" \
    GIT_COMMITTER_DATE="$commit_date" \
    git commit -m "$message"
}

echo "Mock history generation script created. Run individual generation scripts to populate data."
