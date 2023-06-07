/**
 * offer router
 */

import { factories } from "@strapi/strapi";

export default {
  routes: [
    {
      method: "POST",
      path: "/offer/check",
      handler: "offer.checkOffer",
    },
  ],
};
