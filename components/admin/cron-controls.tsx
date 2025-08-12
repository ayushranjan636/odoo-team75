"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CronControls() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const { toast } = useToast()

  const handleProcessLateReturns = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/cron/process-late-returns", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setLastRun(new Date().toLocaleString())
        toast({
          title: "Late Returns Processed",
          description: "Successfully processed all late returns and applied fees.",
        })
      } else {
        throw new Error(data.error || "Failed to process late returns")
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Cron Jobs
        </CardTitle>
        <CardDescription>Manually trigger scheduled tasks for testing and maintenance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Process Late Returns</h4>
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Mock
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Check for overdue rentals and apply late fees automatically</p>
            {lastRun && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Last run: {lastRun}
              </p>
            )}
          </div>
          <Button onClick={handleProcessLateReturns} disabled={isProcessing} size="sm">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
          <strong>Note:</strong> In production, this would run automatically via scheduled cron jobs. This manual
          trigger is provided for testing and demonstration purposes.
        </div>
      </CardContent>
    </Card>
  )
}
