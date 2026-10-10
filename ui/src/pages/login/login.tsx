import { Typography } from 'antd';
import { Navigate, generatePath, useSearchParams } from 'react-router-dom';

import { isSafeRedirectPath, redirectToQueryParam } from '@ui/config/auth';
import { paths } from '@ui/config/paths';
import { useAuthContext } from '@ui/features/auth/context/use-auth-context';
import { OIDCLogin } from '@ui/features/auth/oidc-login';
import { LoadingState } from '@ui/features/common';
import { useDocumentTitle } from '@ui/features/common/document-title/use-document-title';
import { KargoLogo } from '@ui/features/common/logo/logo';
import { useGetPublicConfig } from '@ui/gen/api/v2/system/system';

import * as styles from './login.module.less';

export const Login = () => {
  useDocumentTitle(['Login']);
  const { data: response, isLoading } = useGetPublicConfig();
  const data = response?.data;
  const [params] = useSearchParams();
  const { isLoggedIn } = useAuthContext();
  const redirectTo = params.get(redirectToQueryParam);
  const safeRedirectTo = isSafeRedirectPath(redirectTo) ? redirectTo : null;

  if (data?.skipAuth) {
    return <Navigate to={paths.home} replace />;
  }

  const isOIDCCallback = params.has('code') && params.has('state');

  if (isLoggedIn && !isOIDCCallback) {
    return <Navigate to={safeRedirectTo ? generatePath(safeRedirectTo) : paths.home} replace />;
  }

  return (
    <div className={styles.container}>
      <KargoLogo />
      <div className={styles.box}>
        {isLoading && <LoadingState />}
        {/*
          SSO only. The admin account stays ENABLED for CLI/API break-glass,
          but the password form is deliberately not rendered. To restore it,
          re-add the AdminLogin block and the "OR" Divider from upstream
          login.tsx.
        */}
        {data?.oidcConfig && <OIDCLogin oidcConfig={data.oidcConfig} />}
        {data && !data.oidcConfig && !data.adminAccountEnabled && (
          <Typography.Text>
            Login is disabled. Please contact your system administrator.
          </Typography.Text>
        )}
      </div>
    </div>
  );
};
