/**
 * A set of functions called "actions" for `health`
 */

export default {
  health: async (ctx, next) => {
    try {
      // ping database in strapi
      const hello = await strapi.query("db-health").findMany();
      ctx.body = "ok";
    } catch (err) {
      ctx.body = err;
    }
  },
};
