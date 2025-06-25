#!/bin/bash
cd /home/kavia/workspace/code-generation/reactcrm-pro-71862-65dfe4f0/crm_frontend_workspace/crm_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

