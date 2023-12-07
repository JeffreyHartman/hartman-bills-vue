import { createStore } from 'vuex';

function generateBillInstances(bill) {
  let instances = [];
  let startDate = new Date(bill.creationDate || new Date());
  let oneYearFromNow = new Date();  
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (!bill.recurring) {
    let dueDate = new Date(bill.dueDate);
    let isPaid = checkIfPaid(bill, dueDate);
    instances.push({ ...bill, dueDate, isPaid });
    return instances;
  }

  while (startDate < oneYearFromNow) {
    let dueDate = calculateDueDate(bill.recurring, startDate);
    let isPaid = checkIfPaid(bill, dueDate);
    instances.push({ ...bill, dueDate, isPaid });
    startDate = incrementDate(bill.recurring, startDate);
  }
  return instances;
}

function calculateDueDate(recurring, startDate) {
  let dueDate = new Date(startDate);
  switch (recurring.unit) {
    case 'day':
      dueDate.setDate(dueDate.getDate() + recurring.interval);
      break;
    case 'week':
      dueDate.setDate(dueDate.getDate() + recurring.interval * 7);
      break;
    case 'month':
      dueDate.setMonth(dueDate.getMonth() + recurring.interval);
      dueDate.setDate(recurring.dayOfMonth);
      break;
    case 'year':
      dueDate = calculateYearlyDueDate(dueDate, recurring.dayOfYear, recurring.interval);
      break;
  }
  return dueDate;
}

function calculateYearlyDueDate(startDate, dayOfYear, interval) {
  const year = startDate.getFullYear() + interval;
  const dueDate = new Date(year, 0);
  dueDate.setDate(dayOfYear); 
  return dueDate;
}

function checkIfPaid(bill, dueDate) {
  return bill.paidDates.some(paidDate => {
    let d1 = new Date(paidDate);
    let d2 = new Date(dueDate);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  });
}

function incrementDate(recurring, startDate) {
  let nextDate = new Date(startDate);
  switch (recurring.unit) {
    case 'day':
      nextDate.setDate(nextDate.getDate() + recurring.interval);
      break;
    case 'week':
      nextDate.setDate(nextDate.getDate() + recurring.interval * 7);
      break;
    case 'month':
      nextDate.setMonth(nextDate.getMonth() + recurring.interval);
      break;
    case 'year':
      nextDate.setFullYear(nextDate.getFullYear() + recurring.interval);
      break;
  }
  return nextDate;
}

const store = createStore({
  state() {
    return {
      isSidebarOpen: false,
      bills: [
        {
          id: 1,
          name: 'Allowance',
          creationDate: '2023-06-01T12:00:00Z',
          dueDate: null,
          amount: 100.00,
          recurring: {
            interval: 2,
            unit: 'week',
            dayOfWeek: 3, // 0 for Sunday...6 for Saturday
            dayOfMonth: null,
            dayOfYear: null,
          },
          paidDates: ['2023-07-01T12:00:00Z', '2023-06-01T12:00:00Z']
        },
        {
          id: 2,
          name: 'Water',
          creationDate: '2023-06-01T12:00:00Z',
          dueDate: null,
          amount: 50.00,
          recurring: {
            interval: 1,
            unit: 'month',
            dayOfWeek: null,
            dayOfMonth: 15,
            dayOfYear: null,
          },
          paidDates: ['2023-07-15T12:00:00Z', '2023-06-15T12:00:00Z', '2023-08-15T12:00:00Z']
        },
        {
          id: 3,
          name: 'Property Tax',
          creationDate: '2023-06-01T12:00:00Z',
          dueDate: null,
          amount: 80.00,
          recurring: {
            interval: 1,
            unit: 'year',
            dayOfWeek: null,
            dayOfMonth: null,
            dayOfYear: 360,
          },
          paidDates: ['2023-07-15T12:00:00Z', '2023-06-15T12:00:00Z']
        },
        // Non-recurring bill
        {
          id: 4,
          name: 'Car Repair',
          creationDate: '2023-06-01T12:00:00Z',
          dueDate: new Date('2023-08-19T12:00:00Z'),
          amount: 200.00,
          recurring: null,
          paidDates: [],
        }
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
      const today = new Date();
      return state.bills.flatMap(bill => generateBillInstances(bill)).filter(instance => {
        const dueDate = new Date(instance.dueDate);
        return dueDate > today && !instance.isPaid;
      });
    },
    overdueBills(state) {
      const today = new Date();
      return state.bills.flatMap(bill => generateBillInstances(bill)).filter(instance => {
        const dueDate = new Date(instance.dueDate);
        return dueDate < today && !instance.isPaid;
      });
    },
    recurringBills(state) {
      return state.bills.filter(bill => bill.recurring !== null);
    },
    paidBills(state) {
      // Flatten the bills array and the paidDates arrays into a single array of paid bills
      return state.bills.flatMap(bill => bill.paidDates.map(paidDate => ({ ...bill, paidDate })));
    },
    billById(state) {
      return (id) => {
        return state.bills.find(bill => bill.id === id);
      }
    }
  },
});

export default store;
