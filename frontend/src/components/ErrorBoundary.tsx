import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-page">
          <div className="max-w-md w-full bg-surface rounded-2xl shadow-[var(--sf-card-shadow)] border border-line p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-2xl font-bold text-ink mb-2">
                Something went wrong
              </h1>
              <p className="text-ink-mute mb-6">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
              {this.state.error && (
                <details className="text-left mb-6">
                  <summary className="cursor-pointer text-sm text-ink-mute mb-2">
                    Error details
                  </summary>
                  <pre className="text-xs bg-well border border-line p-4 rounded-xl overflow-auto text-ink-mid">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-brand text-on-brand py-2.5 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
