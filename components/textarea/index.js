import rules from "../../miniprogram_npm/lin-ui/behaviors/rules";
import eventBus from "../../miniprogram_npm/lin-ui/utils/eventBus";
Component({
  behaviors: ["wx://form-field", rules],
  externalClasses: ["l-class", "l-error-text", "l-error-text-class", "l-inner-class"],
  properties: {
    placeholder: {
      type: String,
      value: ""
    },
    value: {
      type: String,
      value: ""
    },
    focus: {
      type: Boolean,
      value: !1
    },
    maxlength: {
      type: Number,
      value: 140
    },
    indicator: {
      type: Boolean,
      value: !0
    },
    autoHeight: {
      type: Boolean,
      value: !1
    },
    disabled: {
      type: Boolean,
      value: !1
    },
    border: {
      type: Boolean,
      value: !0
    },
    rules: {
      type: Object
    },
    placeholderStyle: {
      type: String,
      value: ""
    }
  },
  data: {},
  attached() {
    this.initRules()
  },
  methods: {
    handleInputChange(e) {
      const {
        detail: t = {}
      } = e, {
        value: l = ""
      } = t;
      this.setData({
        value: l
      }), eventBus.emit(`lin-form-change-${this.id}`, this.id), this.triggerEvent("lininput", e.detail)
    },
    handleInputFocus(e) {
      this.triggerEvent("linfocus", e.detail)
    },
    handleInputBlur(e) {
      this.validatorData({
        [this.data.name]: e.detail.value
      }), eventBus.emit(`lin-form-blur-${this.id}`, this.id), this.triggerEvent("linblur", e.detail)
    },
    handleInputConfirm(e) {
      this.triggerEvent("linconfirm", e.detail)
    },
    getValues() {
      return this.data.value
    },
    reset() {
      this.data.value = ""
    }
  }
});