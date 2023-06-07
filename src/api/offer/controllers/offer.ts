/**
 * offer controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::offer.offer",
  ({ strapi }) => ({
    async checkOffer(ctx) {
      // get offer code from request body
      try {
        const { offerCode }: { offerCode: string } = ctx.request.body;
        //   check if offer code exists
        const offer = await strapi.entityService.findMany("api::offer.offer", {
          filters: {
            Offer_Code: offerCode.toUpperCase(),
          },
        });
        let data: object;

        data = {
          data: {
            valid: true,
            offerName: offer[0].Offer_Name,
            offerType: offer[0].Type,
            discountPercentage: offer[0].Percentage_Off,
            discountAmount: offer[0].Amount_Off,
            maxDiscount: offer[0].Max_Off,
          },
        };

        ctx.body = data;
      } catch (err) {
        ctx.badRequest("Offer code does not exist", { moreDetails: err });
      }
    },
  })
);
