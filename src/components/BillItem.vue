<template>
  <div class="bill-item">
    <h2>{{ bill.name }}</h2>
    <div class="bill-item__meta">
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