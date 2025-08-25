// Đây là một placeholder. Trong thực tế sẽ dùng thư viện như react-hot-toast.
export const toast = {
  success: (message: string) => {
    console.log(`SUCCESS TOAST: ${message}`);
    alert(`SUCCESS: ${message}`);
  },
  error: (message: string) => {
    console.error(`ERROR TOAST: ${message}`);
    alert(`ERROR: ${message}`);
  },
};
