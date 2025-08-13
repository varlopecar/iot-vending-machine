import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

export interface PaymentMetrics {
  paymentSuccessTotal: number;
  paymentFailureTotal: number;
  paymentDurationSeconds: number[];
  averagePaymentTime: number;
}

@Injectable()
export class PaymentMonitoringMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PaymentMonitoringMiddleware.name);
  private metrics: PaymentMetrics = {
    paymentSuccessTotal: 0,
    paymentFailureTotal: 0,
    paymentDurationSeconds: [],
    averagePaymentTime: 0,
  };

  use(req: Request, res: Response, next: NextFunction) {
    // Intercepter uniquement les routes de paiement
    if (this.isPaymentRoute(req.path)) {
      const startTime = performance.now();
      const requestId = this.generateRequestId();

      // Ajouter des informations de traçage
      req['paymentTrace'] = {
        requestId,
        startTime,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      };

      // Logger le début de la requête
      this.logPaymentRequest(req, requestId);

      // Intercepter la réponse
      const originalSend = res.send;
      res.send = (body: any) => {
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // Convertir en secondes

        // Logger la fin de la requête
        this.logPaymentResponse(req, res, body, duration, requestId);

        // Mettre à jour les métriques
        this.updateMetrics(res.statusCode, duration);

        // Appeler la méthode originale
        return originalSend.call(res, body);
      };

      // Intercepter les erreurs
      res.on('error', (error: Error) => {
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;

        this.logPaymentError(req, error, duration, requestId);
        this.updateMetrics(500, duration);
      });
    }

    next();
  }

  private isPaymentRoute(path: string): boolean {
    const paymentRoutes = [
      '/trpc/stripe.createPaymentIntent',
      '/trpc/stripe.confirmPaymentIntent',
      '/trpc/stripe.cancelPaymentIntent',
      '/trpc/checkout.createIntent',
      '/webhooks/stripe',
    ];
    return paymentRoutes.some((route) => path.includes(route));
  }

  private generateRequestId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logPaymentRequest(req: Request, requestId: string): void {
    const trace = req['paymentTrace'];
    const logData = {
      requestId,
      event: 'payment_request_started',
      timestamp: trace.timestamp,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      body: this.sanitizeRequestBody(req.body),
    };

    this.logger.log(JSON.stringify(logData));
  }

  private logPaymentResponse(
    req: Request,
    res: Response,
    body: any,
    duration: number,
    requestId: string,
  ): void {
    const trace = req['paymentTrace'];
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

    const logData = {
      requestId,
      event: isSuccess ? 'payment_request_completed' : 'payment_request_failed',
      timestamp: new Date().toISOString(),
      durationSeconds: duration.toFixed(3),
      statusCode: res.statusCode,
      path: req.path,
      method: req.method,
      responseSize: JSON.stringify(body).length,
      success: isSuccess,
    };

    if (isSuccess) {
      this.logger.log(JSON.stringify(logData));
    } else {
      this.logger.error(JSON.stringify(logData));
    }
  }

  private logPaymentError(
    req: Request,
    error: Error,
    duration: number,
    requestId: string,
  ): void {
    const trace = req['paymentTrace'];
    const logData = {
      requestId,
      event: 'payment_request_error',
      timestamp: new Date().toISOString(),
      durationSeconds: duration.toFixed(3),
      path: req.path,
      method: req.method,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    };

    this.logger.error(JSON.stringify(logData));
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };

    // Masquer les informations sensibles
    if (sanitized.client_secret) {
      sanitized.client_secret = '***';
    }
    if (sanitized.secret) {
      sanitized.secret = '***';
    }
    if (sanitized.token) {
      sanitized.token = '***';
    }

    return sanitized;
  }

  private updateMetrics(statusCode: number, duration: number): void {
    if (statusCode >= 200 && statusCode < 300) {
      this.metrics.paymentSuccessTotal++;
    } else {
      this.metrics.paymentFailureTotal++;
    }

    this.metrics.paymentDurationSeconds.push(duration);

    // Garder seulement les 1000 dernières mesures
    if (this.metrics.paymentDurationSeconds.length > 1000) {
      this.metrics.paymentDurationSeconds =
        this.metrics.paymentDurationSeconds.slice(-1000);
    }

    // Calculer la moyenne
    const sum = this.metrics.paymentDurationSeconds.reduce((a, b) => a + b, 0);
    this.metrics.averagePaymentTime =
      sum / this.metrics.paymentDurationSeconds.length;
  }

  /**
   * Récupère les métriques actuelles
   */
  getMetrics(): PaymentMetrics {
    return { ...this.metrics };
  }

  /**
   * Récupère les métriques au format Prometheus
   */
  getPrometheusMetrics(): string {
    const metrics = this.getMetrics();

    return `# HELP payment_success_total Total des paiements réussis
# TYPE payment_success_total counter
payment_success_total ${metrics.paymentSuccessTotal}

# HELP payment_failure_total Total des paiements échoués
# TYPE payment_failure_total counter
payment_failure_total ${metrics.paymentFailureTotal}

# HELP payment_duration_seconds Durée des paiements en secondes
# TYPE payment_duration_seconds histogram
payment_duration_seconds_bucket{le="0.1"} ${metrics.paymentDurationSeconds.filter((d) => d <= 0.1).length}
payment_duration_seconds_bucket{le="0.5"} ${metrics.paymentDurationSeconds.filter((d) => d <= 0.5).length}
payment_duration_seconds_bucket{le="1.0"} ${metrics.paymentDurationSeconds.filter((d) => d <= 1.0).length}
payment_duration_seconds_bucket{le="2.0"} ${metrics.paymentDurationSeconds.filter((d) => d <= 2.0).length}
payment_duration_seconds_bucket{le="5.0"} ${metrics.paymentDurationSeconds.filter((d) => d <= 5.0).length}
payment_duration_seconds_bucket{le="+Inf"} ${metrics.paymentDurationSeconds.length}
payment_duration_seconds_sum ${metrics.paymentDurationSeconds.reduce((a, b) => a + b, 0).toFixed(3)}
payment_duration_seconds_count ${metrics.paymentDurationSeconds.length}

# HELP payment_average_duration_seconds Durée moyenne des paiements
# TYPE payment_average_duration_seconds gauge
payment_average_duration_seconds ${metrics.averagePaymentTime.toFixed(3)}`;
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics(): void {
    this.metrics = {
      paymentSuccessTotal: 0,
      paymentFailureTotal: 0,
      paymentDurationSeconds: [],
      averagePaymentTime: 0,
    };
  }
}
