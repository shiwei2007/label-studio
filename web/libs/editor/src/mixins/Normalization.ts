import { types } from "mobx-state-tree";

/**
 * @todo rework this into MetaMixin for all the meta data
 * @todo it's used by too much files, so that's for later
 * Meta Information
 * Additional information for regions and their results, like text and lead_time
 * Only text is used here actually, lead_time is stored directly in results
 */
const NormalizationMixin = types
  .model({
    meta: types.frozen<{ text?: string[]; comments?: { user: string; text: string; datetime: string }[] }>({}),
  })
  .actions((self) => ({
    /**
     * Set meta text
     * @param {*} text
     */
    setMetaText(text: string) {
      if (text) {
        self.meta = { ...self.meta, text: [text] };
      } else {
        const adjusted = { ...self.meta };

        delete adjusted.text;
        self.meta = adjusted;
      }
    },
  }))
  .actions((self) => ({
    /**
     * Delete meta text
     */
    deleteMetaText() {
      self.setMetaText("");
    },

    addMetaComment(user: string, text: string) {
      if (!text) return;
      const comments = self.meta?.comments ?? [];
      self.meta = {
        ...self.meta,
        comments: [...comments, { user, text, datetime: new Date().toISOString() }],
      };
    },

    deleteMetaComment(datetime: string) {
      const comments = self.meta?.comments ?? [];
      const updated = comments.filter((c: any) => c.datetime !== datetime);
      const next = { ...self.meta } as any;

      if (updated.length > 0) next.comments = updated;
      else delete next.comments;

      self.meta = next;
    },
  }));

export default NormalizationMixin;
