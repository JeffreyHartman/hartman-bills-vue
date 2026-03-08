import { createStore } from 'vuex';
import { supabase } from '@/lib/supabase.js';

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
      dueDate.setDate(1);
      dueDate.setMonth(dueDate.getMonth() + recurring.interval);
      if (recurring.dayOfMonth) {
        const lastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        dueDate.setDate(Math.min(recurring.dayOfMonth, lastDay));
      }
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
      nextDate.setDate(1);
      nextDate.setMonth(nextDate.getMonth() + recurring.interval);
      break;
    case 'year':
      nextDate.setFullYear(nextDate.getFullYear() + recurring.interval);
      break;
  }
  return nextDate;
}

// Map Supabase row (snake_case) to app format (camelCase)
function mapBillFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    creationDate: row.creation_date,
    dueDate: row.due_date,
    amount: Number(row.amount),
    recurring: row.recurring,
    paidDates: row.paid_dates || [],
  };
}

// Map app format to Supabase row for insert/update
function mapBillToDb(bill, userId) {
  const row = {
    name: bill.name,
    amount: bill.amount,
    recurring: bill.recurring || null,
    paid_dates: bill.paidDates || [],
  };
  if (bill.creationDate !== undefined) row.creation_date = bill.creationDate;
  if (bill.dueDate !== undefined) row.due_date = bill.dueDate;
  if (userId) row.user_id = userId;
  return row;
}

const mutations = {
  toggleSidebar(state) {
    state.isSidebarOpen = !state.isSidebarOpen;
  },
  setDarkMode(state, value) {
    state.darkMode = value;
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist preference in a cookie (no expiry = session, so set 10 years)
    document.cookie = `darkMode=${value ? '1' : '0'}; path=/; max-age=${60 * 60 * 24 * 365 * 10}; SameSite=Lax`;
  },
  toggleDarkMode(state) {
    mutations.setDarkMode(state, !state.darkMode);
  },
  setUser(state, user) {
    state.user = user;
  },
  setBills(state, bills) {
    state.bills = bills;
  },
  addBill(state, bill) {
    state.bills.push(bill);
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

const actions = {
  async fetchBills({ commit }) {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('fetchBills failed:', error);
      throw error;
    }
    commit('setBills', data.map(mapBillFromDb));
  },

  async addBill({ commit, state }, billData) {
    const row = mapBillToDb(billData, state.user?.id);
    const { data, error } = await supabase
      .from('bills')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('addBill failed:', error);
      throw error;
    }
    commit('addBill', mapBillFromDb(data));
  },

  async updateBill({ commit }, updatedBill) {
    const row = mapBillToDb(updatedBill);
    const { data, error } = await supabase
      .from('bills')
      .update(row)
      .eq('id', updatedBill.id)
      .select()
      .single();

    if (error) {
      console.error('updateBill failed:', error);
      throw error;
    }
    commit('updateBill', mapBillFromDb(data));
  },

  async deleteBill({ commit }, billId) {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId);

    if (error) {
      console.error('deleteBill failed:', error);
      throw error;
    }
    commit('deleteBill', billId);
  },

  async markPaid({ commit, state }, { billId, date }) {
    const bill = state.bills.find(b => b.id === billId);
    if (!bill) {
      console.error('markPaid: bill not found:', billId);
      return;
    }

    const target = new Date(date);
    const alreadyPaid = bill.paidDates.some(pd => {
      const d = new Date(pd);
      return d.getFullYear() === target.getFullYear() &&
             d.getMonth() === target.getMonth() &&
             d.getDate() === target.getDate();
    });
    if (alreadyPaid) return;

    const newPaidDates = [...bill.paidDates, target.toISOString()];
    const { error } = await supabase
      .from('bills')
      .update({ paid_dates: newPaidDates })
      .eq('id', billId);

    if (error) {
      console.error('markPaid failed:', error);
      throw error;
    }
    commit('markPaid', { billId, date });
  },

  async markUnpaid({ commit, state }, { billId, date }) {
    const bill = state.bills.find(b => b.id === billId);
    if (!bill) {
      console.error('markUnpaid: bill not found:', billId);
      return;
    }

    const target = new Date(date);
    const newPaidDates = bill.paidDates.filter(pd => {
      const d = new Date(pd);
      return !(d.getFullYear() === target.getFullYear() &&
               d.getMonth() === target.getMonth() &&
               d.getDate() === target.getDate());
    });
    const { error } = await supabase
      .from('bills')
      .update({ paid_dates: newPaidDates })
      .eq('id', billId);

    if (error) {
      console.error('markUnpaid failed:', error);
      throw error;
    }
    commit('markUnpaid', { billId, date });
  },

  async logout({ commit }) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut failed:', err);
    }
    commit('setUser', null);
    commit('setBills', []);
  }
};

function readDarkModeCookie() {
  const match = document.cookie.match(/(?:^|;\s*)darkMode=(\d)/);
  return match ? match[1] === '1' : false;
}

const store = createStore({
  state() {
    const darkMode = typeof document !== 'undefined' && readDarkModeCookie();
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    return {
      isSidebarOpen: false,
      darkMode,
      user: null,
      bills: []
    };
  },
  mutations,
  actions,
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
    recurringBills(state, getters) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.bills
        .filter(b => b.recurring !== null)
        .map(b => {
          // Find the next upcoming unpaid instance for display
          const instance = getters.allInstances
            .filter(i => i.id === b.id && !i.isPaid && new Date(i.dueDate) >= today)
            .sort((a, c) => new Date(a.dueDate) - new Date(c.dueDate))[0];
          return {
            ...b,
            dueDate: instance ? instance.dueDate : b.creationDate,
            isPaid: false,
            instanceId: instance ? instance.instanceId : b.id,
          };
        });
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
export { mutations, generateBillInstances, checkIfPaid, calculateDueDate, incrementDate, readDarkModeCookie };
