<template>
  <div class="pt-6">
    <form @submit.prevent="saveBill" novalidate class="space-y-4">
      <!-- Instance-only edit form -->
      <div v-if="editScope === 'instance'" class="card p-6 space-y-5">
        <p class="text-xs font-medium text-surface-400 uppercase tracking-wider">Editing {{ instanceDateLabel }}</p>

        <!-- Amount -->
        <div>
          <label for="instanceAmount" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-mono">$</span>
            <input
              id="instanceAmount"
              :value="instanceForm.amountDisplay"
              @input="onInstanceAmountInput"
              @keydown="onAmountKeydown"
              type="text"
              inputmode="decimal"
              class="input-field pl-8 font-mono"
              placeholder="0.00"
            >
          </div>
        </div>

        <!-- Due Date -->
        <div>
          <label for="instanceDueDate" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Due Date</label>
          <input
            id="instanceDueDate"
            v-model="instanceForm.dueDate"
            type="date"
            class="input-field"
          >
        </div>
      </div>

      <!-- Full edit form -->
      <div v-else class="card p-6 space-y-5">
        <!-- Icon & Color Picker -->
        <div>
          <label class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Icon</label>
          <button
            type="button"
            @click="showIconPicker = !showIconPicker"
            class="w-full flex items-center gap-3 mb-3 p-2 -mx-2 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: form.iconColor }"
            >
              <component :is="selectedIconComponent" class="w-6 h-6 text-white" :stroke-width="1.75" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-medium">{{ selectedIconLabel }}</p>
              <p class="text-xs text-surface-400">Tap to change icon and color</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                 class="w-4 h-4 text-surface-300 flex-shrink-0 transition-transform" :class="showIconPicker ? 'rotate-180' : ''">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div v-if="showIconPicker" class="space-y-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <!-- Icon grid -->
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="icon in billIcons"
                :key="icon.key"
                type="button"
                @click="form.icon = icon.key"
                class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                :style="{ backgroundColor: form.icon === icon.key ? form.iconColor : 'transparent' }"
                :class="form.icon === icon.key ? 'ring-2 ring-offset-2 ring-accent' : 'hover:bg-surface-200 dark:hover:bg-surface-700'"
                :title="icon.label"
              >
                <component :is="getIconComponent(icon.key)" class="w-5 h-5" :class="form.icon === icon.key ? 'text-white' : 'text-surface-500'" :stroke-width="1.75" />
              </button>
            </div>
            <!-- Color grid -->
            <div>
              <p class="text-xs text-surface-400 mb-1.5">Background color</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in iconColors"
                  :key="color"
                  type="button"
                  @click="form.iconColor = color"
                  class="w-8 h-8 rounded-full transition-all"
                  :style="{ backgroundColor: color }"
                  :class="form.iconColor === color ? 'ring-2 ring-offset-2 ring-surface-400' : 'hover:scale-110'"
                ></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Name -->
        <div>
          <label for="name" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Bill Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="input-field"
            placeholder="e.g. Electric Bill"
            maxlength="100"
            required
          >
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-mono">$</span>
            <input
              id="amount"
              :value="form.amountDisplay"
              @input="onAmountInput"
              @keydown="onAmountKeydown"
              type="text"
              inputmode="decimal"
              class="input-field pl-8 font-mono"
              placeholder="0.00"
              required
            >
          </div>
        </div>

        <!-- Due Date (for non-recurring) -->
        <div v-if="!form.isRecurring">
          <label for="dueDate" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Due Date</label>
          <input
            id="dueDate"
            v-model="form.dueDate"
            type="date"
            class="input-field"
            required
          >
        </div>

        <!-- Recurring toggle -->
        <div class="flex items-center justify-between py-1">
          <span class="text-sm font-medium">Recurring</span>
          <button
            type="button"
            @click="form.isRecurring = !form.isRecurring"
            class="relative w-11 h-6 rounded-full transition-colors duration-200"
            :class="form.isRecurring ? 'bg-accent' : 'bg-surface-300 dark:bg-surface-600'"
            role="switch"
            :aria-checked="form.isRecurring"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
              :class="form.isRecurring ? 'translate-x-5' : ''"
            ></span>
          </button>
        </div>

        <!-- Recurring settings -->
        <div v-if="form.isRecurring" class="space-y-4 pl-0 border-l-2 border-accent/20 ml-0 pl-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="interval" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Every</label>
              <input
                id="interval"
                :value="form.interval"
                @input="onIntervalInput"
                @keydown="onIntegerKeydown"
                type="text"
                inputmode="numeric"
                class="input-field"
                required
              >
            </div>
            <div>
              <label for="unit" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Period</label>
              <select id="unit" v-model="form.unit" class="input-field">
                <option value="day">Day(s)</option>
                <option value="week">Week(s)</option>
                <option value="month">Month(s)</option>
                <option value="year">Year(s)</option>
              </select>
            </div>
          </div>

          <div v-if="form.unit === 'month'">
            <label for="dayOfMonth" class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">Day of Month</label>
            <input
              id="dayOfMonth"
              :value="form.dayOfMonth"
              @input="onDayOfMonthInput"
              @keydown="onIntegerKeydown"
              type="text"
              inputmode="numeric"
              class="input-field"
              placeholder="1-31"
            >
          </div>
        </div>
      </div>

      <!-- Form error -->
      <p v-if="formError" class="text-sm text-status-overdue">{{ formError }}</p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button type="button" @click="$router.back()" class="btn-secondary flex-1" :disabled="isSaving">Cancel</button>
        <button type="submit" class="btn-primary flex-1" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : saveButtonLabel }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { sanitizeMonetaryInput, cleanMonetaryPaste, sanitizeIntegerInput, formatDateLong, toLocalDateString } from '@/utils/formatting.js';
import { BILL_ICONS, ICON_COLORS, ICON_MAP, DEFAULT_ICON, DEFAULT_ICON_COLOR } from '@/utils/billIcons.js';
import { Receipt } from 'lucide-vue-next';

export default {
  name: 'EditBillView',
  data() {
    return {
      isSaving: false,
      formError: null,
      editScope: 'all',
      showIconPicker: false,
      billIcons: BILL_ICONS,
      iconColors: ICON_COLORS,
      form: {
        name: '',
        amountDisplay: '',
        dueDate: '',
        isRecurring: false,
        interval: 1,
        unit: 'month',
        dayOfMonth: 1,
        icon: DEFAULT_ICON,
        iconColor: DEFAULT_ICON_COLOR,
      },
      instanceForm: {
        amountDisplay: '',
        dueDate: '',
      }
    };
  },
  computed: {
    ...mapGetters(['billById']),
    isEditing() {
      return !!this.$route.params.id;
    },
    existingBill() {
      if (!this.isEditing) return null;
      return this.billById(this.$route.params.id);
    },
    instanceDate() {
      return this.$route.query.instance || null;
    },
    isRecurringInstance() {
      return this.isEditing && this.existingBill?.recurring && this.instanceDate;
    },
    instanceDateLabel() {
      if (!this.instanceDate) return '';
      const [year, month, day] = this.instanceDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return formatDateLong(d);
    },
    selectedIconComponent() {
      return ICON_MAP[this.form.icon] || Receipt;
    },
    selectedIconLabel() {
      const found = BILL_ICONS.find(i => i.key === this.form.icon);
      return found ? found.label : 'Receipt';
    },
    saveButtonLabel() {
      if (!this.isEditing) return 'Add Bill';
      if (this.editScope === 'instance') return 'Save Instance';
      return 'Save Changes';
    }
  },
  created() {
    if (this.existingBill) {
      const bill = this.existingBill;
      this.form.name = bill.name;
      this.form.amountDisplay = bill.amount != null ? String(bill.amount) : '';
      this.form.isRecurring = !!bill.recurring;
      this.form.icon = bill.icon || DEFAULT_ICON;
      this.form.iconColor = bill.iconColor || DEFAULT_ICON_COLOR;
      if (bill.recurring) {
        this.form.interval = bill.recurring.interval;
        this.form.unit = bill.recurring.unit;
        this.form.dayOfMonth = bill.recurring.dayOfMonth || 1;
      }
      if (bill.dueDate) {
        const d = new Date(bill.dueDate);
        this.form.dueDate = d.toISOString().split('T')[0];
      }

      // Determine edit scope from URL
      if (this.isRecurringInstance) {
        this.editScope = 'instance';
        const override = (bill.overrides || {})[this.instanceDate] || {};
        this.instanceForm.amountDisplay = override.amount != null ? String(override.amount) : String(bill.amount);
        this.instanceForm.dueDate = override.dueDate || this.instanceDate;
      }
    }
  },
  methods: {
    getIconComponent(key) {
      return ICON_MAP[key] || Receipt;
    },
    onAmountKeydown(e) {
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key)) return;
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      if (/^\d$/.test(e.key)) return;
      if (e.key === '.' && !e.target.value.includes('.')) return;
      e.preventDefault();
    },
    onAmountInput(e) {
      const raw = e.target.value;
      const cleaned = raw.includes(',') || raw.includes('$') ? cleanMonetaryPaste(raw) : sanitizeMonetaryInput(raw);
      this.form.amountDisplay = cleaned;
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
    },
    onInstanceAmountInput(e) {
      const raw = e.target.value;
      const cleaned = raw.includes(',') || raw.includes('$') ? cleanMonetaryPaste(raw) : sanitizeMonetaryInput(raw);
      this.instanceForm.amountDisplay = cleaned;
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
    },
    onIntegerKeydown(e) {
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (allowed.includes(e.key)) return;
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
      if (/^\d$/.test(e.key)) return;
      e.preventDefault();
    },
    onIntervalInput(e) {
      const cleaned = sanitizeIntegerInput(e.target.value);
      let num = parseInt(cleaned, 10);
      if (isNaN(num) || num < 1) {
        this.form.interval = cleaned === '' ? '' : 1;
      } else if (num > 365) {
        this.form.interval = 365;
      } else {
        this.form.interval = num;
      }
      e.target.value = this.form.interval;
    },
    onDayOfMonthInput(e) {
      const cleaned = sanitizeIntegerInput(e.target.value);
      let num = parseInt(cleaned, 10);
      if (isNaN(num) || num < 1) {
        this.form.dayOfMonth = cleaned === '' ? '' : 1;
      } else if (num > 31) {
        this.form.dayOfMonth = 31;
      } else {
        this.form.dayOfMonth = num;
      }
      e.target.value = this.form.dayOfMonth;
    },
    validateForm() {
      if (this.editScope === 'instance') {
        const amount = parseFloat(this.instanceForm.amountDisplay);
        if (this.instanceForm.amountDisplay && (isNaN(amount) || amount <= 0)) {
          return 'Please enter a valid amount greater than $0.';
        }
        return null;
      }

      const amount = parseFloat(this.form.amountDisplay);
      if (!this.form.name.trim()) {
        return 'Bill name is required.';
      }
      if (!this.form.amountDisplay || isNaN(amount) || amount <= 0) {
        return 'Please enter a valid amount greater than $0.';
      }
      if (!this.form.isRecurring && !this.form.dueDate) {
        return 'Due date is required for non-recurring bills.';
      }
      if (this.form.isRecurring) {
        const interval = parseInt(this.form.interval, 10);
        if (isNaN(interval) || interval < 1) {
          return 'Interval must be at least 1.';
        }
        if (this.form.unit === 'month') {
          const day = parseInt(this.form.dayOfMonth, 10);
          if (isNaN(day) || day < 1 || day > 31) {
            return 'Day of month must be between 1 and 31.';
          }
        }
      }
      return null;
    },
    async saveBill() {
      if (this.isSaving) return;
      if (this.isEditing && !this.existingBill) return;

      this.formError = null;
      const error = this.validateForm();
      if (error) {
        this.formError = error;
        return;
      }

      this.isSaving = true;

      try {
        if (this.editScope === 'instance') {
          await this.saveInstance();
        } else {
          await this.saveFullBill();
        }
        this.$router.push('/');
      } catch (err) {
        console.error('Failed to save bill:', err);
        this.formError = 'Failed to save bill. Please try again.';
      } finally {
        this.isSaving = false;
      }
    },
    async saveInstance() {
      const overrideData = {};
      const amount = parseFloat(this.instanceForm.amountDisplay);
      if (!isNaN(amount) && amount > 0 && amount !== this.existingBill.amount) {
        overrideData.amount = amount;
      }
      if (this.instanceForm.dueDate && this.instanceForm.dueDate !== this.instanceDate) {
        overrideData.dueDate = this.instanceForm.dueDate;
      }

      await this.$store.dispatch('updateBillOverride', {
        billId: this.existingBill.id,
        instanceDate: this.instanceDate,
        overrideData,
      });
    },
    async saveFullBill() {
      const amount = parseFloat(this.form.amountDisplay);

      const billData = {
        name: this.form.name.trim(),
        amount,
        icon: this.form.icon,
        iconColor: this.form.iconColor,
        recurring: this.form.isRecurring ? {
          interval: parseInt(this.form.interval, 10),
          unit: this.form.unit,
          dayOfWeek: null,
          dayOfMonth: this.form.unit === 'month' ? parseInt(this.form.dayOfMonth, 10) : null,
          dayOfYear: null,
        } : null,
        dueDate: this.form.isRecurring ? null : new Date(this.form.dueDate + 'T12:00:00').toISOString(),
      };

      if (this.isEditing) {
        await this.$store.dispatch('updateBill', {
          id: this.existingBill.id,
          paidDates: this.existingBill.paidDates,
          ...billData,
        });
      } else {
        await this.$store.dispatch('addBill', { ...billData, creationDate: new Date().toISOString() });
      }
    }
  }
};
</script>
