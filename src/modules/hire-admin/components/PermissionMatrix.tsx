import { useEffect, useMemo, useRef } from 'react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import {
  PERMISSION_ACTIONS,
  PERMISSION_ACTION_LABELS,
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  type PermissionAction,
  type PermissionModule,
  type RolePermissions
} from '../schemas/adminCategoryRole';
import {
  columnState,
  rowState,
  toggleCell,
  toggleColumn,
  toggleRow,
  type CheckState
} from './permissionGrid';

/** A checkbox that shows the dash for "some" and keeps a 44px tap target on a phone. */
function Tick({
  label,
  state,
  disabled,
  onChange
}: {
  label: string;
  state: CheckState;
  disabled: boolean;
  onChange: (on: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some';
  }, [state]);
  return (
    <label className="inline-flex size-11 cursor-pointer items-center justify-center has-disabled:cursor-not-allowed lg:size-[calc(30*var(--u))]">
      <input
        ref={ref}
        type="checkbox"
        aria-label={label}
        checked={state === 'all'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-brand-600 lg:size-[calc(16*var(--u))]"
      />
    </label>
  );
}

/** The first row holds the column checkboxes ("all modules"); the others are one module each. */
type Line = PermissionModule | 'all';
const LINES: Line[] = ['all', ...PERMISSION_MODULES];

/*
 * The shared DataTable draws the table. Its own horizontal scroller is switched off here so the
 * card around the matrix is the only scroller and the header row can stay in view while the rows
 * scroll. Below lg the table keeps a minimum width and the card scrolls sideways.
 */
const TUNE = [
  '[&>div>div]:overflow-visible [&_table]:border-separate [&_table]:border-spacing-0',
  '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-[#F5F6FA] [&_thead_th]:font-semibold',
  '[&_tbody_td]:border-t [&_tbody_td]:border-[#EEF0F4]',
  'lg:[&_thead_th]:h-[calc(34*var(--u))] lg:[&_thead_th]:text-dense-sm lg:[&_tbody_td]:h-[calc(34*var(--u))]'
].join(' ');

const CENTER = 'text-center';

/**
 * The permission matrix: modules down the side, actions across the top, a checkbox in every cell.
 * Each module row has an "all" checkbox and the top row has one per column. `onChange` receives
 * the whole new matrix.
 */
export function PermissionMatrix({
  permissions,
  readOnly,
  onChange
}: {
  permissions: RolePermissions;
  readOnly: boolean;
  onChange: (next: RolePermissions) => void;
}) {
  const columns = useMemo<Column<Line>[]>(
    () => [
      {
        id: 'module',
        header: 'Module',
        className: 'lg:pl-[calc(12*var(--u))]!',
        cell: (line) => (
          <span className="text-sm font-semibold text-[#202A3A] lg:text-dense-md">
            {line === 'all' ? 'All modules' : PERMISSION_MODULE_LABELS[line]}
          </span>
        )
      },
      ...PERMISSION_ACTIONS.map((action: PermissionAction): Column<Line> => ({
        id: action,
        header: PERMISSION_ACTION_LABELS[action],
        className: CENTER,
        cell: (line) =>
          line === 'all' ? (
            <Tick
              label={`All modules: ${PERMISSION_ACTION_LABELS[action]}`}
              state={columnState(permissions, action)}
              disabled={readOnly}
              onChange={(on) => onChange(toggleColumn(permissions, action, on))}
            />
          ) : (
            <Tick
              label={`${PERMISSION_MODULE_LABELS[line]}: ${PERMISSION_ACTION_LABELS[action]}`}
              state={permissions[line]?.includes(action) ? 'all' : 'none'}
              disabled={readOnly}
              onChange={(on) => onChange(toggleCell(permissions, line, action, on))}
            />
          )
      })),
      {
        id: 'row_all',
        header: 'All',
        className: CENTER,
        cell: (line) =>
          line === 'all' ? null : (
            <Tick
              label={`${PERMISSION_MODULE_LABELS[line]}: All`}
              state={rowState(permissions, line)}
              disabled={readOnly}
              onChange={(on) => onChange(toggleRow(permissions, line, on))}
            />
          )
      }
    ],
    [permissions, readOnly, onChange]
  );

  return (
    <div className={TUNE}>
      <DataTable<Line>
        density="compact"
        framed={false}
        columns={columns}
        rows={LINES}
        getRowId={(line) => line}
        isLoading={false}
        error={null}
        onRetry={() => undefined}
        empty={{ title: 'No modules' }}
        caption="Permissions by module"
      />
    </div>
  );
}
