import { syncEntryWithAlgolia } from "../../../../custom/algoliaSearch";

module.exports = {
  afterUpdate(event: any) {
    syncEntryWithAlgolia(event, "update");
  },
};
