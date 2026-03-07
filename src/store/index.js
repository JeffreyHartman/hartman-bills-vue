import { createStore } from 'vuex';

function generateBillInstances(bill) {
  const instances = [];
  const startDate = new Date(bill.creationDate || new Date());
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (!bill.recurring) {
    if (!bill.dueDate) return instances;
    const dueDate = new Date(bill.dueDate);
    const isPaid = checkIfPaid(bill, dueDate);
    instances.push({
      ...bill,
      dueDate,
      isPaid,
      instanceId: `${bill.id}-${dueDate.toISOString()}`
    });
    return instances;
  }

  let currentDate = new Date(startDate);
  while (currentDate < oneYearFromNow) {
    const dueDate = calculateDueDate(bill.recurring, currentDate);
    if (dueDate > oneYearFromNow) break;
    const isPaid = checkIfPaid(bill, dueDate);
    instances.push({
      ...bill,
      dueDate,
      isPaid,
      instanceId: `${bill.id}-${dueDate.toISOString()}`
    });
    currentDate = incrementDate(bill.recurring, currentDate);
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
      if (recurring.dayOfMonth) dueDate.setDate(recurring.dayOfMonth);
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
    const d1 = new Date(paidDate);
    const d2 = new Date(dueDate);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  });
}

function incrementDate(recurring, startDate) {
  const nextDate = new Date(startDate);
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

let nextId = 100;

const mutations = {
  toggleSidebar(state) {
    state.isSidebarOpen = !state.isSidebarOpen;
  },
  toggleDarkMode(state) {
    state.darkMode = !state.darkMode;
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  addBill(state, bill) {
    state.bills.push({ ...bill, id: nextId++, paidDates: [] });
  },
  updateBill(state, updatedBill) {
    const index = state.bills.findIndex(b => b.id === updatedBill.id);
    if (index !== -1) {
      state.bills.splice(index, 1, { ...state.bills[index], ...updatedBill });
    }
  },
  deleteBill(state, billId) {
    state.bills = state.bills.filter(b => b.id !== billId);
  },
  markPaid(state, { billId, date }) {
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      const target = new Date(date);
      const alreadyPaid = bill.paidDates.some(pd => {
        const d = new Date(pd);
        return d.getFullYear() === target.getFullYear() &&
               d.getMonth() === target.getMonth() &&
               d.getDate() === target.getDate();
      });
      if (!alreadyPaid) {
        bill.paidDates.push(target.toISOString());
      }
    }
  },
  markUnpaid(state, { billId, date }) {
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      const target = new Date(date);
      bill.paidDates = bill.paidDates.filter(pd => {
        const d = new Date(pd);
        return !(d.getFullYear() === target.getFullYear() &&
                 d.getMonth() === target.getMonth() &&
                 d.getDate() === target.getDate());
      });
    }
  }
};

// Generate dates relative to today for realistic mock data
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function monthsAgo(months) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

const store = createStore({
  state() {
    return {
      isSidebarOpen: false,
      darkMode: false,
      bills: [
        {
          id: 1,
          name: 'Rent',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 1850.00,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 1, dayOfYear: null },
          paidDates: [daysFromNow(-60), daysFromNow(-30)]
        },
        {
          id: 2,
          name: 'Electric',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 142.50,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 15, dayOfYear: null },
          paidDates: [daysFromNow(-45), daysFromNow(-15)]
        },
        {
          id: 3,
          name: 'Water & Sewer',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 67.00,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 20, dayOfYear: null },
          paidDates: [daysFromNow(-40)]
        },
        {
          id: 4,
          name: 'Internet',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 79.99,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 5, dayOfYear: null },
          paidDates: [daysFromNow(-55), daysFromNow(-25)]
        },
        {
          id: 5,
          name: 'Car Insurance',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 215.00,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 10, dayOfYear: null },
          paidDates: [daysFromNow(-50)]
        },
        {
          id: 6,
          name: 'Phone',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 85.00,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 22, dayOfYear: null },
          paidDates: [daysFromNow(-38)]
        },
        {
          id: 7,
          name: 'Gym Membership',
          creationDate: monthsAgo(3),
          dueDate: null,
          amount: 49.99,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 1, dayOfYear: null },
          paidDates: [daysFromNow(-60), daysFromNow(-30)]
        },
        {
          id: 8,
          name: 'Netflix',
          creationDate: monthsAgo(6),
          dueDate: null,
          amount: 15.99,
          recurring: { interval: 1, unit: 'month', dayOfWeek: null, dayOfMonth: 8, dayOfYear: null },
          paidDates: [daysFromNow(-52), daysFromNow(-22)]
        },
        {
          id: 9,
          name: 'Property Tax',
          creationDate: monthsAgo(12),
          dueDate: null,
          amount: 2400.00,
          recurring: { interval: 1, unit: 'year', dayOfWeek: null, dayOfMonth: null, dayOfYear: 90 },
          paidDates: []
        },
        {
          id: 10,
          name: 'Car Repair',
          creationDate: monthsAgo(1),
          dueDate: daysFromNow(14),
          amount: 450.00,
          recurring: null,
          paidDates: []
        },
        {
          id: 11,
          name: 'Dentist Visit',
          creationDate: monthsAgo(1),
          dueDate: daysFromNow(-5),
          amount: 175.00,
          recurring: null,
          paidDates: []
        }
      ]
    };
  },
  mutations,
  getters: {
    allInstances(state) {
      return state.bills.flatMap(bill => generateBillInstances(bill));
    },
    upcomingBills(state, getters) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return getters.allInstances
        .filter(i => new Date(i.dueDate) >= today && !i.isPaid)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    },
    overdueBills(state, getters) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return getters.allInstances
        .filter(i => new Date(i.dueDate) < today && !i.isPaid)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    },
    recurringBills(state) {
      return state.bills.filter(b => b.recurring !== null);
    },
    paidBills(state, getters) {
      return getters.allInstances
        .filter(i => i.isPaid)
        .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    },
    billById(state) {
      return (id) => state.bills.find(b => b.id === id);
    },
    totalDue(state, getters) {
      return getters.upcomingBills.reduce((sum, b) => sum + b.amount, 0);
    },
    totalOverdue(state, getters) {
      return getters.overdueBills.reduce((sum, b) => sum + b.amount, 0);
    },
    summaryStats(state, getters) {
      return {
        upcomingCount: getters.upcomingBills.length,
        upcomingTotal: getters.totalDue,
        overdueCount: getters.overdueBills.length,
        overdueTotal: getters.totalOverdue,
        paidCount: getters.paidBills.length,
        recurringCount: getters.recurringBills.length
      };
    }
  }
});

export default store;

// Export for testing
export { mutations, generateBillInstances, checkIfPaid, calculateDueDate, incrementDate };
