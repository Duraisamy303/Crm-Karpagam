import CommonLoader from '@/pages/elements/commonLoader';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const PrivateRouter = (WrappedComponent: any) => {
    const Component = (props: any) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            const token =
                localStorage.getItem('kaheToken')


            if (!token) {
                router.replace('/auth/signin');
            } else {
                setIsAuthenticated(true);
                setIsLoading(false);
            }
        }, [router]);

        if (isLoading && !isAuthenticated) {
            return (
                <div>
                    <CommonLoader />
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };

    if (WrappedComponent?.getLayout) {
        Component.getLayout = WrappedComponent.getLayout;
    }

    return Component;
};

export default PrivateRouter;
