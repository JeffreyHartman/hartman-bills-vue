<template>
  <bills-list></bills-list>
</template>

<script>
// @ is an alias to /src
import BillsList from '@/components/BillsList.vue'

export default {
  name: 'BillsView',
  components: {
    BillsList
  },  
}
</script>
