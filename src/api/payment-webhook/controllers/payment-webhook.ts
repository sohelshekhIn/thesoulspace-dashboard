/**
 * A set of functions called "actions" for `payment webhook`
 */

import * as crypto from "crypto";

function verifyMac(data: Record<string, any>, salt: string): boolean {
  // Remove the 'mac' key from the data object
  const { mac, ...dataWithoutMac } = data;
  // Sort the keys alphabetically
  const sortedKeys = Object.keys(dataWithoutMac).sort((a, b) =>
    a.localeCompare(b)
  );
  // Prepare a string with values separated by pipes ('|')
  const concatenatedValues = sortedKeys
    .map((key) => dataWithoutMac[key])
    .join("|");
  // Calculate the MAC using HMAC-SHA1
  const hmac = crypto.createHmac("sha1", salt);
  hmac.update(concatenatedValues);
  const macCalculated = hmac.digest("hex");
  // Compare the calculated MAC with the provided MAC
  return macCalculated === mac;
}

export default {
  paymentWebhook: async (ctx, next) => {
    const data = ctx.request.body;
    const isVerified = verifyMac(data, process.env.INSTAMOJO_SALT);

    if (!isVerified) {
      console.log(isVerified);
      ctx.body = "error";
      ctx.status = 403;
    } else {
      const orderId = data.purpose.split("#")[1];
      const order = await strapi.entityService.findMany(
        "api::up-order.up-order",
        {
          filters: {
            orderId: orderId,
          },
        }
      );
      const orderToUpdate = order[0].id;

      try {
        const updatedUpOrders = await strapi.entityService.update(
          "api::up-order.up-order",
          orderToUpdate,
          {
            data: {
              payment_status: "paid",
              payment_id: `${data.payment_request_id}-${data.payment_id}`,
              payment_fees: parseFloat(data.fees),
            },
          }
        );
        ctx.body = "ok";
      } catch (error) {
        console.error("Error updating entity:", error);
        ctx.body = "error";
        ctx.status = 403;
      }
    }
  },
};
