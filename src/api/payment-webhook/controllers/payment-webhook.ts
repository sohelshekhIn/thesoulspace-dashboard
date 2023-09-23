import * as crypto from "crypto";
import {
  PmtWebhookUpOrdrContactType,
  PmtWebhookUpOrdrValueType,
} from "../../../../types/GlobalTypes";

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

async function getProductInfo(productId) {
  const product = await strapi.entityService.findOne(
    "api::product.product",
    productId,
    {
      fields: ["Name", "Price", "id"],
    }
  );

  return product;
}

async function createOrderVariables(orderData) {
  const productsMarkdown = [];
  let index = 1;
  const products = await Promise.all(
    orderData.cart.map(async (item) => {
      const product = await getProductInfo(item.product);
      const productInfo = `${index}) ${product.Name} - ${product.id} \n\t Size: ${item.sizeDescription} \n\t Price: ${product.Price} \n\t Qty: ${item.quantity} \n\n\n`;
      productsMarkdown.push(productInfo);
      index += 1;
      return {
        name: product.Name,
        price: product.Price,
        sizeDescription: item.sizeDescription,
        quantity: item.quantity,
      };
    })
  );

  return { productsMarkdown, products };
}

export default {
  paymentWebhook: async (ctx, next) => {
    console.time("webhook");
    const data = ctx.request.body;
    const isVerified = verifyMac(data, process.env.INSTAMOJO_SALT);
    if (!isVerified) {
      ctx.body = "error";
      ctx.status = 403;
      return;
    }
    const orderId = data.purpose.split("#")[1];
    const order = await strapi.entityService.findMany(
      "api::up-order.up-order",
      {
        filters: {
          orderId: orderId,
        },
      }
    );

    if (order.length === 0) {
      ctx.body = "error";
      ctx.status = 403;
      return;
    }

    const orderToUpdate = order[0].id;
    const paymentStatus = order[0].payment_status;

    try {
      // if payment status is already paid, return ok
      // as on first webhook call, payment status is updated to paid but due to
      // timeout, webhook is called again, to to prevent unique constraint error
      // return ok

      if (paymentStatus === "paid") {
        ctx.body = "ok";
        return;
      }
      const { productsMarkdown, products } = await createOrderVariables(
        order[0]
      );

      const contactObject: PmtWebhookUpOrdrContactType = order[0].contact;
      const valueObject: PmtWebhookUpOrdrValueType = order[0].value;

      const userId = order[0].userId;
      const upOrderId = order[0].id;
      const dateTime = order[0].dateTime;

      const name = `${contactObject.firstName} ${contactObject.lastName}`;
      const contact = `${contactObject.phone} | ${contactObject.email}`;
      const address = `${contactObject.address.line1} \n ${contactObject.address.line2} \n ${contactObject.address.landmark} \n ${contactObject.address.city} \n ${contactObject.address.state} \n ${contactObject.address.pincode}`;
      const grandTotal = parseInt(valueObject.grandTotal);
      const offerJson = valueObject.offer;
      const totalQty = valueObject.totalQuantity;

      const updatePromise = strapi.entityService.update(
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

      const createOrderPromise = strapi.entityService.create(
        "api::order.order",
        {
          data: {
            orderId: orderId,
            dateTime: dateTime,
            name: name,
            contact: contact,
            address: address,
            grandTotal: grandTotal,
            userId: userId,
            cartItems: productsMarkdown.join(""),
            cartItemsJson: products,
            offerJson: offerJson,
            totalQty: totalQty,
            upOrderId: upOrderId,
          },
        }
      );

      await Promise.all([updatePromise, createOrderPromise]);
      console.timeEnd("webhook");
      ctx.body = "ok";
    } catch (error) {
      console.error("Error updating entity:", error.details);
      ctx.body = "error";
      ctx.status = 403;
    }
  },
};
