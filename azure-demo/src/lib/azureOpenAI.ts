import { env } from "@/lib/env";

export type AzureOpenAIResult = {
  text: string;
  raw?: unknown;
};

export function azureOpenAIConfigured() {
  if (!env.useAzureOpenAI) return { enabled: false, configured: false };
  const ok = Boolean(env.azureOpenAIEndpoint && env.azureOpenAIApiKey);
  return { enabled: true, configured: ok };
}

function buildResponsesUrl(params: {
  endpoint: string;
  apiVersion: string;
  deployment?: string;
}) {
  const { endpoint, apiVersion, deployment } = params;

  // Support both:
  // - Base resource URL: https://{resource}.openai.azure.com
  // - Full responses URL: https://{resource}.openai.azure.com/openai/responses?api-version=...
  // - Full deployments responses URL: https://.../openai/deployments/{dep}/responses?api-version=...
  //
  // If the provided endpoint already includes an /openai/ path, treat it as a fully-qualified
  // request URL and only ensure api-version is present.
  //
  // Special case: if the endpoint is the non-deployment Responses URL (`/openai/responses`)
  // but a deployment is configured, rewrite to the deployment-scoped URL.
  if (/\/openai\//i.test(endpoint)) {
    try {
      const url = new URL(endpoint);

      const pathLower = url.pathname.toLowerCase();
      const hasDeployments = pathLower.includes("/openai/deployments/");
      const isNonDeploymentResponses = pathLower.endsWith("/openai/responses");

      if (deployment && isNonDeploymentResponses && !hasDeployments) {
        const rewritten = new URL(url.origin);
        rewritten.pathname = `/openai/deployments/${encodeURIComponent(
          deployment,
        )}/responses`;

        const v = url.searchParams.get("api-version") ?? apiVersion;
        rewritten.searchParams.set("api-version", v);
        return rewritten.toString();
      }

      if (!url.searchParams.get("api-version")) {
        url.searchParams.set("api-version", apiVersion);
      }
      return url.toString();
    } catch {
      // Fall back to best-effort string handling if URL parsing fails.
      if (/api-version=/i.test(endpoint)) return endpoint;
      const joiner = endpoint.includes("?") ? "&" : "?";
      return `${endpoint}${joiner}api-version=${encodeURIComponent(apiVersion)}`;
    }
  }

  const base = endpoint.replace(/\/$/, "");
  const encodedApiVersion = encodeURIComponent(apiVersion);

  if (deployment) {
    return `${base}/openai/deployments/${encodeURIComponent(
      deployment,
    )}/responses?api-version=${encodedApiVersion}`;
  }

  return `${base}/openai/responses?api-version=${encodedApiVersion}`;
}

export async function callAzureOpenAIResponse(prompt: string): Promise<AzureOpenAIResult> {
  if (!env.azureOpenAIEndpoint || !env.azureOpenAIApiKey) {
    throw new Error("Azure OpenAI is not configured");
  }

  const url = buildResponsesUrl({
    endpoint: env.azureOpenAIEndpoint,
    apiVersion: env.azureOpenAIApiVersion,
    deployment: env.azureOpenAIDeployment,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": env.azureOpenAIApiKey,
    },
    body: JSON.stringify({
      input: prompt,
      temperature: 0.2,
    }),
  });

  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      (raw?.error?.message as string | undefined) ??
      (raw?.message as string | undefined) ??
      "";

    const safeDetail = detail
      ? detail.slice(0, 500)
      : JSON.stringify(raw).slice(0, 500);

    throw new Error(
      `Azure OpenAI request failed (${res.status}): ${safeDetail || "(no details)"}`,
    );
  }

  const text =
    // Typical Responses API shape: output[].content[].text
    (raw?.output?.[0]?.content?.[0]?.text as string | undefined) ??
    (raw?.output_text as string | undefined) ??
    (raw?.choices?.[0]?.message?.content as string | undefined) ??
    "";

  return { text: text || "(no text)", raw };
}
