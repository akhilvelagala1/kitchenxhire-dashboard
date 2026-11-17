import { Download, History } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { ExportButton } from '@/shared/components/ExportButton';
import { PermissionGate } from '@/shared/components/PermissionGate';
import { Button } from '@/shared/ui/Button';
import { adminCategoriesApi } from '../api/adminCategoriesApi';
import { HIRE_ADMIN_PERMISSIONS as P } from '../permissions';
import { parseCategoriesSearchParams, toCategoriesListQuery } from './categoriesPageParams';

const WHITE_BUTTON =
  'min-h-11 rounded-[11px] border-[#E1E5EC]! bg-white! text-sm font-semibold whitespace-nowrap text-[#111111]! ' +
  'shadow-[0_2px_6px_rgba(20,35,60,0.05)] lg:h-[calc(42*var(--u))] lg:min-h-0 lg:rounded-[calc(12*var(--u))]';

/** Audit Logs opens the audit dialog; Export downloads the filtered categories. Export needs the manage permission. */
export function CategoriesRolesHeaderActions({ onOpenAuditLogs }: { onOpenAuditLogs: () => void }) {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-[calc(10*var(--u))]">
      <Button variant="secondary" onClick={onOpenAuditLogs} className={`${WHITE_BUTTON} px-4`}>
        <History aria-hidden className="size-4" />
        Audit Logs
      </Button>
      <PermissionGate permission={P.manage}>
        <div className="relative flex-none">
          <Download
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-[#111111]"
          />
          <ExportButton
            label="Export"
            start={() =>
              adminCategoriesApi.exportCategories(
                toCategoriesListQuery(parseCategoriesSearchParams(searchParams)),
                []
              )
            }
            className={`${WHITE_BUTTON} pr-4! pl-10!`}
          />
        </div>
      </PermissionGate>
    </div>
  );
}
