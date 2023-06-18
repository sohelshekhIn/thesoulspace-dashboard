/**
 * A set of functions called "actions" for `health`
 */

export default {
  health: async (ctx, next) => {
    try {
      ctx.body = "ok";
    } catch (err) {
      ctx.body = err;
    }
  },
};
