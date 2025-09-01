export enum TransactionType {
    // Customer purchases
    PURCHASE = 'purchase',
    
    // Inventory restocking
    RESTOCK = 'restock',
    
    // Manual adjustments (admin only)
    ADJUSTMENT = 'adjustment',
    
    // Customer returns
    RETURN = 'return',
    
    // Damaged goods
    DAMAGED = 'damaged',
    
    // Expired products
    EXPIRED = 'expired',
    
    // Stock transfer between locations
    TRANSFER_IN = 'transfer_in',
    TRANSFER_OUT = 'transfer_out',
    
    
    HOLD = 'hold',
    RELEASE = 'release',
    
    
    SAMPLE = 'sample',
    
    
    LOST = 'lost',
    
    
    FOUND = 'found',
    
    
    CYCLE_COUNT = 'cycle_count'
  }