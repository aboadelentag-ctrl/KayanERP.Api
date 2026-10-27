export interface PermissionState {
  canView: boolean;
  canExecute: boolean;
}

export const usePermission = () => {
  const getPermission = (actionId: string): PermissionState => {
    try {
      const stored = localStorage.getItem('kayan_roles_matrix');
      const userRaw = localStorage.getItem('user');
      const currentUser = userRaw ? JSON.parse(userRaw) : null;
      const roleId = currentUser?.roleId || 'ROLE_ADMIN';

      if (roleId === 'ROLE_ADMIN') {
        return { canView: true, canExecute: true };
      }

      if (stored) {
        const matrix = JSON.parse(stored);
        const role = matrix.find((r: any) => r.roleId === roleId);
        if (role && role.permissions && role.permissions[actionId]) {
          return {
            canView: role.permissions[actionId].view,
            canExecute: role.permissions[actionId].execute
          };
        }
      }
    } catch (e) {
      console.error(e);
    }

    return { canView: true, canExecute: true };
  };

  return { getPermission };
};
