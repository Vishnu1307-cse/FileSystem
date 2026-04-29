import { usePage } from '@inertiajs/react';

export default function Can({ permission, children, fallback = null }) {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];
    
    // Now strictly checking permissions without admin bypass
    // to allow admin to hide their own dashboard items.
    const hasPermission = permissions.includes(permission);

    if (hasPermission) {
        return <>{children}</>;
    }

    return fallback;
}
