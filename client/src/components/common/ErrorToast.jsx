import React, { useEffect } from 'react';

/**
 * Error Toast Component
 * Shows friendly error messages to users
 */

// Simple toast implementation (can be replaced with react-hot-toast if available)
let toastContainer = null;

const createToastContainer = () => {
  if (toastContainer) return toastContainer;
  
  toastContainer = document.createElement('div');
  toastContainer.id = 'error-toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
};

const showToast = (message, type = 'error') => {
  const container = createToastContainer();
  const toast = document.createElement('div');
  
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  
  toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`;
  toast.style.cssText = `
    animation: slideIn 0.3s ease-out;
    min-width: 300px;
    max-width: 500px;
  `;
  
  toast.innerHTML = `
    <span class="text-lg">${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
    <span class="flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 hover:opacity-70">✕</button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
};

// Add CSS animations
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export const showAPIError = (message) => {
  showToast(message || 'Connection failed. Please retry.', 'error');
};

export const showSuccess = (message) => {
  showToast(message || 'Operation successful!', 'success');
};

export const showInfo = (message) => {
  showToast(message || 'Info', 'info');
};

export default function ErrorToast() {
  // This component can be used as a wrapper if needed
  return null;
}

