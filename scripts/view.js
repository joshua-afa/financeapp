import { db, utils } from './supabase.js';

class TransactionViewer {
  constructor() {
    this.filters = {};
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.transactions = [];
    this.deleteTransactionId = null;
    this.init();
  }

  async init() {
    try {
      utils.showLoading();
      await this.loadFormData();
      await this.loadTransactions();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing transaction viewer:', error);
      utils.showNotification('Error loading data. Please check your Supabase configuration.', 'error');
    } finally {
      utils.hideLoading();
    }
  }

  async loadFormData() {
    const [accounts, categories] = await Promise.all([
      db.getAccounts(),
      db.getCategories()
    ]);

    this.populateFilterAccounts(accounts);
    this.populateFilterCategories(categories);
  }

  populateFilterAccounts(accounts) {
    const accountSelect = document.getElementById('filterAccount');
    if (!accountSelect) return;

    accountSelect.innerHTML = '<option value="">All Accounts</option>';
    
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = `${account.name} (${account.type})`;
      accountSelect.appendChild(option);
    });
  }

  populateFilterCategories(categories) {
    const categorySelect = document.getElementById('filterCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = `${category.name} (${category.type})`;
      categorySelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // Filter form submission
    const filtersForm = document.getElementById('filtersForm');
    if (filtersForm) {
      filtersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFilterSubmit();
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportTransactions();
      });
    }

    // Delete modal functionality
    const deleteModal = document.getElementById('deleteModal');
    const closeBtn = deleteModal?.querySelector('.close');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDeleteModal());
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
    }

    if (deleteModal) {
      window.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
          this.closeDeleteModal();
        }
      });
    }
  }

  async handleFilterSubmit() {
    try {
      utils.showLoading();

      const formData = new FormData(document.getElementById('filtersForm'));
      this.filters = {
        date_from: formData.get('date_from') || null,
        date_to: formData.get('date_to') || null,
        account_id: formData.get('account_id') || null,
        type: formData.get('type') || null,
        category_id: formData.get('category_id') || null
      };

      // Remove null values
      Object.keys(this.filters).forEach(key => {
        if (!this.filters[key]) {
          delete this.filters[key];
        }
      });

      this.currentPage = 1;
      await this.loadTransactions();

    } catch (error) {
      console.error('Error applying filters:', error);
      utils.showNotification('Error applying filters. Please try again.', 'error');
    } finally {
      utils.hideLoading();
    }
  }

  clearFilters() {
    document.getElementById('filtersForm').reset();
    this.filters = {};
    this.currentPage = 1;
    this.loadTransactions();
  }

  async loadTransactions() {
    try {
      this.transactions = await db.getTransactions(this.filters);
      this.renderTransactions();
      this.renderSummary();
      this.renderPagination();
    } catch (error) {
      console.error('Error loading transactions:', error);
      throw error;
    }
  }

  renderTransactions() {
    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedTransactions = this.transactions.slice(startIndex, endIndex);

    if (paginatedTransactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No transactions found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = paginatedTransactions.map(transaction => `
      <tr>
        <td>${utils.formatDate(transaction.date)}</td>
        <td>${transaction.description || '-'}</td>
        <td>${transaction.categories?.name || 'Uncategorized'}</td>
        <td>${transaction.subcategories?.name || '-'}</td>
        <td>${transaction.accounts?.name || 'Unknown'}</td>
        <td>
          <span class="transaction-type ${transaction.type}">${transaction.type}</span>
        </td>
        <td class="${transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}">
          ${transaction.type === 'income' ? '+' : '-'}${utils.formatCurrency(transaction.amount)}
        </td>
        <td>
          <button class="btn btn-small btn-danger" onclick="window.transactionViewer.openDeleteModal(${transaction.id})">
            Delete
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderSummary() {
    const totals = this.transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += parseFloat(transaction.amount);
      } else {
        acc.expense += parseFloat(transaction.amount);
      }
      acc.count++;
      return acc;
    }, { income: 0, expense: 0, count: 0 });

    const net = totals.income - totals.expense;

    // Update summary elements
    const totalIncomeElement = document.getElementById('totalIncomeFiltered');
    const totalExpensesElement = document.getElementById('totalExpensesFiltered');
    const netAmountElement = document.getElementById('netAmountFiltered');
    const totalTransactionsElement = document.getElementById('totalTransactionsFiltered');

    if (totalIncomeElement) {
      totalIncomeElement.textContent = utils.formatCurrency(totals.income);
    }

    if (totalExpensesElement) {
      totalExpensesElement.textContent = utils.formatCurrency(totals.expense);
    }

    if (netAmountElement) {
      netAmountElement.textContent = utils.formatCurrency(net);
      netAmountElement.className = `summary-amount ${net >= 0 ? 'income' : 'expense'}`;
    }

    if (totalTransactionsElement) {
      totalTransactionsElement.textContent = totals.count.toString();
    }
  }

  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = `
      <button ${this.currentPage === 1 ? 'disabled' : ''} onclick="window.transactionViewer.goToPage(${this.currentPage - 1})">
        Previous
      </button>
    `;

    // Show page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);

    if (startPage > 1) {
      paginationHTML += `<button onclick="window.transactionViewer.goToPage(1)">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span>...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="${i === this.currentPage ? 'active' : ''}" onclick="window.transactionViewer.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span>...</span>`;
      }
      paginationHTML += `<button onclick="window.transactionViewer.goToPage(${totalPages})">${totalPages}</button>`;
    }

    paginationHTML += `
      <button ${this.currentPage === totalPages ? 'disabled' : ''} onclick="window.transactionViewer.goToPage(${this.currentPage + 1})">
        Next
      </button>
    `;

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderTransactions();
    this.renderPagination();
    
    // Scroll to top of table
    document.getElementById('transactionsTable').scrollIntoView({ behavior: 'smooth' });
  }

  exportTransactions() {
    if (this.transactions.length === 0) {
      utils.showNotification('No transactions to export.', 'warning');
      return;
    }

    const exportData = this.transactions.map(transaction => ({
      Date: utils.formatDate(transaction.date),
      Description: transaction.description || '',
      Category: transaction.categories?.name || 'Uncategorized',
      Subcategory: transaction.subcategories?.name || '',
      Account: transaction.accounts?.name || 'Unknown',
      Type: transaction.type,
      Amount: transaction.amount
    }));

    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    utils.exportToCSV(exportData, filename);
    utils.showNotification('Transactions exported successfully!', 'success');
  }

  openDeleteModal(transactionId) {
    this.deleteTransactionId = transactionId;
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.style.display = 'none';
      this.deleteTransactionId = null;
    }
  }

  async confirmDelete() {
    if (!this.deleteTransactionId) return;

    try {
      utils.showLoading();
      await db.deleteTransaction(this.deleteTransactionId);
      utils.showNotification('Transaction deleted successfully!', 'success');
      
      this.closeDeleteModal();
      await this.loadTransactions();
      
    } catch (error) {
      console.error('Error deleting transaction:', error);
      utils.showNotification('Error deleting transaction. Please try again.', 'error');
    } finally {
      utils.hideLoading();
    }
  }
}

// Global functions for pagination and delete operations
window.goToPage = (page) => {
  if (window.transactionViewer) {
    window.transactionViewer.goToPage(page);
  }
};

window.openDeleteModal = (transactionId) => {
  if (window.transactionViewer) {
    window.transactionViewer.openDeleteModal(transactionId);
  }
};

window.closeDeleteModal = () => {
  if (window.transactionViewer) {
    window.transactionViewer.closeDeleteModal();
  }
};

// Initialize transaction viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.transactionViewer = new TransactionViewer();
});