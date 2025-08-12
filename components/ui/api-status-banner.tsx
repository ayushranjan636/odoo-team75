"use client"

// components/ui/api-status-banner.tsx - Banner for unconnected endpoints

import { AlertTriangle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ApiStatusBannerProps {
  endpoint: string
  method?: string
  samplePayload?: any
  onDismiss?: () => void
}

export function ApiStatusBanner({ endpoint, method = "GET", samplePayload, onDismiss }: ApiStatusBannerProps) {
  return (
    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-medium text-orange-800 dark:text-orange-200">Backend endpoint not connected</p>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            <code className="bg-orange-100 dark:bg-orange-900 px-1 py-0.5 rounded text-xs">
              {method} {endpoint}
            </code>
          </p>
          {samplePayload && (
            <details className="text-xs text-orange-600 dark:text-orange-400">
              <summary className="cursor-pointer hover:text-orange-800 dark:hover:text-orange-200">
                Sample payload
              </summary>
              <pre className="mt-1 bg-orange-100 dark:bg-orange-900 p-2 rounded overflow-x-auto">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300 hover:bg-orange-100 bg-transparent"
            asChild
          >
            <a
              href="https://docs.example.com/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              API Docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-orange-700 hover:bg-orange-100">
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
