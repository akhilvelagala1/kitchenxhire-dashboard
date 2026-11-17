declare module 'virtual:browser-mock' {
  export function handleMockApiRequest(req: unknown, res: unknown): Promise<boolean>;
}
