import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
    // You can also log error messages to an error reporting service here
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md text-center status-card">
            <CardHeader className="flex flex-col items-center">
              <AlertCircle className="w-16 h-16 text-destructive mb-4" />
              <CardTitle className="text-2xl font-bold text-foreground">
                Something went wrong!
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                An unexpected error occurred. Please try reloading the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={this.handleReload} className="w-full btn-attendance">
                Reload Page
              </Button>
              {this.state.error && (
                <details className="text-sm text-muted-foreground text-left p-3 bg-muted rounded-md">
                  <summary className="cursor-pointer font-medium text-foreground">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;