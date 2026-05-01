function truthy(value: string | undefined) {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const env = {
  useAzureOpenAI: truthy(process.env.DEMO_USE_AZURE_OPENAI),
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIDeployment:
    process.env.AZURE_OPENAI_MODEL_DEPLOYMENT ??
    process.env.AZURE_OPENAI_DEPLOYMENT,
  azureOpenAIApiVersion:
    process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-01-preview",

  useDocumentIntelligence: truthy(process.env.DEMO_USE_DOCUMENT_INTELLIGENCE),
  documentIntelligenceEndpoint: process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
  documentIntelligenceApiKey: process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY,
  documentIntelligenceApiVersion:
    process.env.AZURE_DOCUMENT_INTELLIGENCE_API_VERSION ?? "2024-11-30",
} as const;
