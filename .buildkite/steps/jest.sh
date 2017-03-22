#!/bin/bash
set -euo pipefail

echo "+++ :jest: Running Jest"
yarn run test-with-coverage

echo "👌 Looks good to me!"

echo "--- :compression: Packaging coverage report"
tar -c -v -z -f "coverage/lcov-report-${BUILDKITE_ORGANIZATION_SLUG}-${BUILDKITE_PIPELINE_SLUG}-${BUILDKITE_COMMIT}.tgz" -C "coverage/lcov-report" "."

echo "📑 Done!"
