export class Logger {
  private static readonly COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
  };

  private static getTimestamp(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    } as any);
  }

  private static formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = this.getTimestamp();
    let dataStr = '';
    if (data) {
      try {
        if (data instanceof Error) {
          dataStr = ` | ${data.message} | ${data.stack}`;
        } else {
          dataStr = ` | ${JSON.stringify(data)}`;
        }
      } catch {
        dataStr = ` | [Unable to serialize data]`;
      }
    }
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  static info(message: string, data?: unknown): void {
    console.log(
      `${this.COLORS.CYAN}${this.formatMessage('INFO', message, data)}${this.COLORS.RESET}`
    );
  }

  static success(message: string, data?: unknown): void {
    console.log(
      `${this.COLORS.GREEN}${this.formatMessage('SUCCESS', message, data)}${this.COLORS.RESET}`
    );
  }

  static warn(message: string, data?: unknown): void {
    console.log(
      `${this.COLORS.YELLOW}${this.formatMessage('WARN', message, data)}${this.COLORS.RESET}`
    );
  }

  static error(message: string, data?: unknown): void {
    console.error(
      `${this.COLORS.RED}${this.formatMessage('ERROR', message, data)}${this.COLORS.RESET}`
    );
  }

  static debug(message: string, data?: unknown): void {
    console.log(
      `${this.COLORS.DIM}${this.formatMessage('DEBUG', message, data)}${this.COLORS.RESET}`
    );
  }

  static section(title: string): void {
    console.log(
      `${this.COLORS.BRIGHT}${this.COLORS.BLUE}\n${'='.repeat(80)}\n${title}\n${'='.repeat(80)}${this.COLORS.RESET}\n`
    );
  }

  static divider(): void {
    console.log(`${this.COLORS.DIM}${'-'.repeat(80)}${this.COLORS.RESET}`);
  }
}
