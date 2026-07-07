const { readState, writeState, resetState, defaultState } = require('./storage');

function getStore() {
  const state = readState();
  return state;
}

function resetDemoData() {
  const state = {
    ...defaultState,
    appointments: [],
  };
  writeState(state);
  return state;
}

function listItems(collection) {
  const state = getStore();
  return state[collection] || [];
}

function createItem(collection, payload) {
  const state = getStore();
  const item = {
    id: `${collection.slice(0, 3)}-${Date.now()}`,
    ...payload,
  };
  state[collection] = state[collection] || [];
  state[collection].push(item);
  writeState(state);
  return item;
}

function updateItem(collection, id, updates) {
  const state = getStore();
  const items = state[collection] || [];
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  items[index] = { ...items[index], ...updates };
  writeState(state);
  return items[index];
}

function deleteItem(collection, id) {
  const state = getStore();
  const items = state[collection] || [];
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = items.splice(index, 1);
  writeState(state);
  return removed;
}

module.exports = {
  resetDemoData,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  resetState,
};
