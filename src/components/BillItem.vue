<template>
  <div class="bill-item mb-4">
    <div class="font-bold text-xl mb-2">{{ bill.name }}</div>
    <div class="text-gray-700 text-base">
      <p>Due: {{ bill.dueDate }}</p>
      <p>Amount: {{ bill.amount }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillItem',
  props: {
    bill: {
      type: Object,
      required: true
    }
  }
}
</script>