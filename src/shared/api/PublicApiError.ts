export class PublicApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'PublicApiError';
  }
}
