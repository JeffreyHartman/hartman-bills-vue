import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      isSidebarOpen: false,
      bills: [
        { id: 1, name: 'Electricity', dueDate: '2023-08-01T12:00:00Z', amount: 100.00, status: 'upcoming', recurring: true },
        { id: 2, name: 'Water', dueDate: '2023-08-16T12:00:00Z', amount: 50.00, status: 'paid', recurring: null },
        { id: 3, name: 'Internet', dueDate: '2023-08-19T12:00:00Z', amount: 80.00, status: 'upcoming', recurring: null },
        { id: 1, name: 'Electricity', dueDate: '2023-09-09T12:00:00Z', amount: 100.00, status: 'upcoming', recurring: null },
        { id: 2, name: 'Water', dueDate: '2023-09-16T12:00:00Z', amount: 50.00, status: 'upcoming', recurring: null },
        { id: 3, name: 'Internet', dueDate: '2023-09-19T12:00:00Z', amount: 80.00, status: 'upcoming', recurring: null }
      ]
    };
  }, 
  mutations: {
    toggleSidebar(state) {      
      state.isSidebarOpen = !state.isSidebarOpen;
    }
  },
  getters: {
    upcomingBills(state) {
      return state.bills.filter(bill => bill.status === 'upcoming');
    },
    paidBills(state) {
      return state.bills.filter(bill => bill.status === 'paid');
    },
    billById(state) {
      return (id) => {
        return state.bills.find(bill => bill.id === id);
      }
    }
  },
});

export default store;
