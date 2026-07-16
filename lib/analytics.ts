export interface LogPayload {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export interface AILogPayload {
  skill: string;
  promptCategory: string;
  latencyMs: number;
  tokensEstimated?: number;
  success: boolean;
  errorMessage?: string;
  timestamp: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {
    // Initialize Sentry, GA4, Firebase Perf here in a real environment
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public trackEvent(eventName: string, properties?: Record<string, any>) {
    const payload: LogPayload = {
      eventName,
      properties,
      timestamp: Date.now()
    };
    
    // Stub: Forward to GA4 / Sentry
    if (process.env.NODE_ENV !== 'production') {
      // Intentionally not using console.log due to clean-logs script constraint
    }
  }

  public trackAIRequest(payload: Omit<AILogPayload, 'timestamp'>) {
    const fullPayload: AILogPayload = {
      ...payload,
      timestamp: Date.now()
    };

    // Stub: Forward to centralized AI monitoring dashboard
    this.trackEvent('ai_request', fullPayload as any);
  }

  public recordError(error: Error, context?: Record<string, any>) {
    // Stub: Sentry.captureException(error)
    this.trackEvent('exception', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }
}

export const analytics = AnalyticsService.getInstance();
