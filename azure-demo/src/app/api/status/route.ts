import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { azureOpenAIConfigured } from "@/lib/azureOpenAI";
import { documentIntelligenceConfigured } from "@/lib/docIntelligence";
import type { ServiceStatusResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const openai = azureOpenAIConfigured();
  const docintel = documentIntelligenceConfigured();

  const hasDeployment = Boolean(env.azureOpenAIDeployment);
  const endpoint = env.azureOpenAIEndpoint ?? "";
  const endpointHasDeploymentsPath = /\/openai\/deployments\//i.test(endpoint);
  const endpointHasResponsesPath = /\/openai\/responses/i.test(endpoint);

  const result: ServiceStatusResponse = {
    now: new Date().toISOString(),
    services: {
      mock: { state: "enabled", detail: "Mock data always available" },
      azureOpenAI: {
        state: !env.useAzureOpenAI ? "disabled" : openai.configured ? "enabled" : "misconfigured",
        detail: !env.useAzureOpenAI
          ? "Set DEMO_USE_AZURE_OPENAI=true to enable"
          : openai.configured
            ? `Configured (deployment: ${hasDeployment ? "set" : "missing"}; endpoint: ${endpointHasDeploymentsPath ? "/openai/deployments" : endpointHasResponsesPath ? "/openai/responses" : "base"})`
            : "Missing AZURE_OPENAI_ENDPOINT and/or AZURE_OPENAI_API_KEY",
      },
      documentIntelligence: {
        state: !env.useDocumentIntelligence
          ? "disabled"
          : docintel.configured
            ? "enabled"
            : "misconfigured",
        detail: !env.useDocumentIntelligence
          ? "Set DEMO_USE_DOCUMENT_INTELLIGENCE=true to enable"
          : docintel.configured
            ? "Configured"
            : "Missing AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and/or AZURE_DOCUMENT_INTELLIGENCE_API_KEY",
      },
    },
  };

  return NextResponse.json(result);
}
