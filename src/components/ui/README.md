# UI Components Usage Guide

## Modal Components

The modal system provides reusable confirmation and alert dialogs that replace the basic `confirm()` and `alert()` browser functions with a better user experience.

### Basic Usage

```tsx
import { ConfirmModal, AlertModal, useModal } from "@/components/ui/Modal";

function MyComponent() {
  const confirmModal = useModal();
  const alertModal = useModal();

  const handleDelete = () => {
    confirmModal.openModal({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      onConfirm: () => {
        // Delete logic here
        alertModal.openModal({
          title: "Success",
          message: "Item deleted successfully",
          type: "success",
        });
      },
    });
  };

  return (
    <>
      <button onClick={handleDelete}>Delete Item</button>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={confirmModal.modalData?.onConfirm}
        title={confirmModal.modalData?.title || ""}
        message={confirmModal.modalData?.message || ""}
        type="danger"
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.closeModal}
        title={alertModal.modalData?.title || ""}
        message={alertModal.modalData?.message || ""}
        type={alertModal.modalData?.type || "info"}
      />
    </>
  );
}
```

### ConfirmModal Props

- `isOpen: boolean` - Whether the modal is open
- `onClose: () => void` - Function to close the modal
- `onConfirm: () => void` - Function to call when confirmed
- `title: string` - Modal title
- `message: string` - Modal message
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `type?: 'danger' | 'warning' | 'info'` - Visual style type (default: "danger")
- `isLoading?: boolean` - Show loading state (default: false)
- `loadingText?: string` - Loading text (default: "Processing...")

### AlertModal Props

- `isOpen: boolean` - Whether the modal is open
- `onClose: () => void` - Function to close the modal
- `title: string` - Modal title
- `message: string` - Modal message
- `type?: 'success' | 'error' | 'warning' | 'info'` - Visual style type (default: "info")
- `buttonText?: string` - Button text (default: "Got it")

## Toast Notifications

Toast notifications provide non-intrusive feedback to users without blocking the interface.

### Setup

First, wrap your app with the ToastProvider:

```tsx
// In your layout.tsx or _app.tsx
import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

### Basic Usage

```tsx
import { useToast } from "@/components/ui/Toast";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Success!", "Your action was completed successfully.");
  };

  const handleError = () => {
    toast.error("Error!", "Something went wrong. Please try again.");
  };

  const handleWarning = () => {
    toast.warning("Warning!", "Please check your input and try again.");
  };

  const handleInfo = () => {
    toast.info("Info", "Here is some helpful information.");
  };

  const handleCustom = () => {
    toast.addToast({
      type: "success",
      title: "Custom Toast",
      message: "This toast has an action button",
      duration: 10000, // 10 seconds
      action: {
        label: "Undo",
        onClick: () => {
          // Undo logic here
          console.log("Undoing action...");
        },
      },
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleCustom}>Show Custom</button>
    </div>
  );
}
```

### Toast Methods

- `toast.success(title, message?, duration?)` - Show success toast
- `toast.error(title, message?, duration?)` - Show error toast
- `toast.warning(title, message?, duration?)` - Show warning toast
- `toast.info(title, message?, duration?)` - Show info toast
- `toast.addToast(options)` - Add custom toast with full options

### Toast Options

- `type: 'success' | 'error' | 'warning' | 'info'` - Toast type
- `title: string` - Toast title
- `message?: string` - Optional toast message
- `duration?: number` - Duration in milliseconds (default: 5000)
- `action?: { label: string, onClick: () => void }` - Optional action button

## Features

### Modals

- ✅ Keyboard navigation (ESC to close)
- ✅ Click outside to close
- ✅ Loading states
- ✅ Multiple types (success, error, warning, info, danger)
- ✅ Custom button text
- ✅ Prevents body scroll
- ✅ Smooth animations
- ✅ Accessibility support

### Toasts

- ✅ Auto-dismiss with progress bar
- ✅ Pause on hover
- ✅ Manual dismiss
- ✅ Stacking
- ✅ Action buttons
- ✅ Multiple types
- ✅ Custom duration
- ✅ Smooth animations
- ✅ Positioned at top-right

## Best Practices

### When to use Modals vs Toasts

**Use Modals for:**

- Critical confirmations (delete, cancel order, etc.)
- Error messages that need immediate attention
- Actions that block the workflow
- Complex messages that need user acknowledgment

**Use Toasts for:**

- Success confirmations
- Non-critical notifications
- Background process updates
- Quick feedback that doesn't interrupt workflow

### Example Implementation

The orders page demonstrates both:

```tsx
// Critical confirmation - uses modal
const handleCancelOrder = async (orderId: string) => {
  showConfirm("Cancel Order", "Are you sure?", async () => {
    try {
      await cancelOrder(orderId);
      // Success feedback - uses toast (non-intrusive)
      toast.success("Order Cancelled", "Your order has been cancelled.");
    } catch (error) {
      // Error feedback - uses modal (needs attention)
      showAlert("Error", "Failed to cancel order.", "error");
    }
  });
};
```

This provides the best user experience by using the appropriate component for each situation.
