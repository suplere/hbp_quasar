# HBP wrapper for using in Quasar

Impelent NHOST SDK to Quasar Framework

Using for example in QUASAR boot file, how I using with Hasura Backend Plus:

```
import { boot } from "quasar/wrappers";
import { createHasuraBackendPlus } from "@suplere/hbp_quasar";
import { Notify } from 'quasar'

function notAuthorizedNotification() {
  Notify.create({
    message: `Not autorized to view this content!`,
    color: 'negative'
  })
}

function notAuthenticatedNotification() {
  Notify.create({
    message: `Only for authenticated users!`,
    color: 'negative'
  })
}

const HBP_URL = process.env.HBP_URL;
const APP_ID = process.env.APP_ID;



export const hbp = createHasuraBackendPlus(
  {
    baseURL: HBP_URL,
    refreshInSeconds: 600,
  },
  {
    loginPath: "/auth/login",
    afterLoginPath: "/",
    registerPath: "/auth/register",
    notAuthorizedPath:"/",
    notAuthorized: notAuthorizedNotification,
    notAuthenticated: notAuthenticatedNotification
  },
  APP_ID
);

export default boot(({ router, store, app }) => {
  hbp.auth.onAuthStateChanged((status) => {
    hbp.handleOnAuthStateChanged(status, store, app);
  });
  router.beforeEach(hbp.routerInitApp);
  router.beforeEach(hbp.routeAuthorizeGuard(router, store));
  app.config.globalProperties.$hbp = hbp;
  store.$hbp = hbp;
});

```