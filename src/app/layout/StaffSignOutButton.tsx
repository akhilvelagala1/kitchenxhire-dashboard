import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ADMIN_LOGIN_PATH } from '@/shared/auth/staffPaths';
import { logoutStaff } from '@/shared/auth/staffAuth';
import { sessionKeys } from '@/shared/auth/sessionKeys';
import { Button } from '@/shared/ui/Button';

export function StaffSignOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function signOut() {
    logoutStaff();
    queryClient.removeQueries({ queryKey: sessionKeys.me });
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  }

  return (
    <Button type="button" variant="ghost" className="w-full justify-start px-3" onClick={signOut}>
      Sign out
    </Button>
  );
}
