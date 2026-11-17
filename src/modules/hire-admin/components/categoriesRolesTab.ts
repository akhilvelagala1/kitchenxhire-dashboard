/** The `tab` URL parameter: `permissions` shows the permission matrix, anything else the two panels. */
export function isPermissionsTab(searchParams: URLSearchParams): boolean {
  return searchParams.get('tab') === 'permissions';
}
