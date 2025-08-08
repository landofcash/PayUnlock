interface ProductStatusBadgeProps {
  status: number | string
  className?: string
}

export function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  // Convert string status to number if needed
  const statusNum = typeof status === 'string' ? parseInt(status) : status;

  // Initial (0) - Gray
  if (statusNum === 0) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 ${className || ''}`}>
        Initial
      </span>
    )
  }

  // Paid (1) - Blue
  if (statusNum === 1) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 ${className || ''}`}>
        Paid
      </span>
    )
  }

  // Code Sent (2) - Yellow
  if (statusNum === 2) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 ${className || ''}`}>
        Code Sent
      </span>
    )
  }

  // Completed (3) - Green
  if (statusNum === 3) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ${className || ''}`}>
        Completed
      </span>
    )
  }

  // Completed Paidout (4) - Green
  if (statusNum === 4) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 ${className || ''}`}>
        Completed Paidout
      </span>
    )
  }

  // Refunded (5) - Red
  if (statusNum === 5) {
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 ${className || ''}`}>
        Refunded
      </span>
    )
  }

  // Unknown/Default - Gray outline
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 ${className || ''}`}>
      Unknown
    </span>
  )
}
