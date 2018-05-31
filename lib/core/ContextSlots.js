import { conditionUses } from "./Conditions";

const DEFAULT_INITIAL_LIFE_SPAN = 2;
export default class ContextSlots {
  slotKeys = [];
  initialLifeSpan;

  constructor(config, slots) {
    const { extraSlotKeys, initialLifeSpan, holdUsedSlot } = config;
    this.initialLifeSpan = initialLifeSpan || DEFAULT_INITIAL_LIFE_SPAN;
    this.slotKeys = ["topic", "target", ...extraSlotKeys];
    this.holdUsedSlot = holdUsedSlot;
    this._assignProperties(slots); // undefinedの場合はkeyすら存在させないようにする
  }

  protectUsedKeys(matchedCondition) {
    this.slotKeys.forEach(key => {
      if (!this[key]) {
        return;
      }

      if (conditionUses(matchedCondition, key)) {
        this[key].lifeSpanCounter = this.initialLifeSpan;
      }
    });
  }

  resetTopic() {
    delete this.topic;
  }

  forget() {
    this.slotKeys.forEach(key => {
      const item = this[key];
      if (!item) {
        return;
      }

      if (typeof item.lifeSpanCounter === "number") {
        item.lifeSpanCounter--;
      } else {
        item.lifeSpanCounter = this.initialLifeSpan;
      }
      if (item.lifeSpanCounter < 0) {
        delete this[key];
      }
    });
  }

  // undefinedの場合はkeyすら存在させないようにする
  _assignProperties(options) {
    this.slotKeys.forEach(key => {
      if (options[key]) {
        this[key] = options[key];
      }
    });
    this._addLifeSpanCounter();
  }

  _addLifeSpanCounter() {
    return this.slotKeys.forEach(key => {
      if (this[key] && this[key].lifeSpanCounter === undefined) {
        this[key].lifeSpanCounter = this.initialLifeSpan;
      }
    });
  }

  setValue(key, value) {
    this[key] = value;
    if (this[key]) {
      this[key].lifeSpanCounter = this.initialLifeSpan;
    }
  }

  merge(newSlots) {
    this._assignProperties({ ...this, ...newSlots });
  }

  replaceByDefaultValue(matchedCondition) {
    this.slotKeys.forEach(key => {
      if (this[key]) {
        return;
      }
      const matchedAsDefaultValue = (matchedCondition[key] || "").match(
        /\[.*?\]/,
      );
      if (matchedAsDefaultValue) {
        const defaultValue = matchedAsDefaultValue[0].replace(/(\[|\])/g, "");
        this.setValue(key, { keyword: defaultValue });
      }
    });
  }
}
