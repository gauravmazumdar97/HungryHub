# UML Use Case Diagram - Food Ordering Application

## Overview
This document describes the Use Case Diagram for the Food Ordering Application built with Angular (Frontend), Node.js (Backend), and MongoDB (Database).

## Actors
1. **Customer** - Regular user who browses food, places orders
2. **Guest User** - Unauthenticated user who can browse but cannot place orders
3. **Admin** - User with administrative privileges (isAdmin: true)

## Use Cases

### Authentication & User Management
1. **Register** - Guest user creates a new account
   - Actor: Guest User
   - Precondition: User is not logged in
   - Postcondition: New user account created, user logged in

2. **Login** - User authenticates to access the system
   - Actor: Guest User, Customer
   - Precondition: User has an account
   - Postcondition: User is authenticated and logged in

3. **Logout** - User logs out of the system
   - Actor: Customer, Admin
   - Precondition: User is logged in
   - Postcondition: User session ended

### Food Browsing & Search
4. **Browse Food Items** - View all available food items
   - Actor: Guest User, Customer
   - Precondition: None
   - Postcondition: Food items displayed

5. **Search Food** - Search for food items by name
   - Actor: Guest User, Customer
   - Precondition: None
   - Postcondition: Matching food items displayed

6. **Filter by Tags** - Filter food items by category/tags
   - Actor: Guest User, Customer
   - Precondition: None
   - Postcondition: Filtered food items displayed

7. **View Food Details** - View detailed information about a specific food item
   - Actor: Guest User, Customer
   - Precondition: Food item exists
   - Postcondition: Food details displayed

### Shopping Cart Management
8. **Add to Cart** - Add a food item to shopping cart
   - Actor: Customer
   - Precondition: User is logged in, food item exists
   - Postcondition: Item added to cart

9. **View Cart** - View items in shopping cart
   - Actor: Customer
   - Precondition: User is logged in
   - Postcondition: Cart contents displayed

10. **Update Cart Item Quantity** - Change quantity of items in cart
    - Actor: Customer
    - Precondition: User is logged in, item exists in cart
    - Postcondition: Cart item quantity updated

11. **Remove from Cart** - Remove an item from shopping cart
    - Actor: Customer
    - Precondition: User is logged in, item exists in cart
    - Postcondition: Item removed from cart

### Order Management
12. **Place Order** - Create a new order from cart items
    - Actor: Customer
    - Precondition: User is logged in, cart is not empty
    - Postcondition: New order created

13. **Proceed to Checkout** - Navigate to checkout page
    - Actor: Customer
    - Precondition: User is logged in, cart is not empty
    - Postcondition: Checkout page displayed

14. **Make Payment** - Process payment for an order
    - Actor: Customer
    - Precondition: Order exists, user is logged in
    - Postcondition: Payment processed, order status updated

15. **Track Order** - View order status and details
    - Actor: Customer
    - Precondition: Order exists, user is logged in
    - Postcondition: Order details displayed

## Use Case Relationships

### Include Relationships
- **Place Order** includes **View Cart**
- **Proceed to Checkout** includes **View Cart**
- **Make Payment** includes **Place Order**

### Extend Relationships
- **Filter by Tags** extends **Browse Food Items**
- **Search Food** extends **Browse Food Items**

## Instructions for Visual Paradigm

1. Go to [Visual Paradigm Online](https://online.visualparadigm.com/)
2. Click on "Use Case Diagram Templates"
3. Select a template or create a new diagram
4. Add the following actors:
   - Customer
   - Guest User
   - Admin
5. Add all use cases listed above
6. Connect actors to their respective use cases
7. Add include/extend relationships as specified
8. Organize use cases into logical groups:
   - Authentication & User Management
   - Food Browsing & Search
   - Shopping Cart Management
   - Order Management

## Visual Structure Suggestion

```
┌─────────────────────────────────────────────────────────┐
│                    Food Ordering System                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Authentication & User Management]                     │
│    • Register                                            │
│    • Login                                               │
│    • Logout                                              │
│                                                          │
│  [Food Browsing & Search]                                │
│    • Browse Food Items                                   │
│    • Search Food <<extends Browse>>                      │
│    • Filter by Tags <<extends Browse>>                  │
│    • View Food Details                                   │
│                                                          │
│  [Shopping Cart Management]                              │
│    • Add to Cart                                         │
│    • View Cart                                           │
│    • Update Cart Item Quantity                           │
│    • Remove from Cart                                    │
│                                                          │
│  [Order Management]                                      │
│    • Place Order <<includes View Cart>>                 │
│    • Proceed to Checkout <<includes View Cart>>         │
│    • Make Payment <<includes Place Order>>              │
│    • Track Order                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Actor-Use Case Mapping

### Guest User
- Register
- Login
- Browse Food Items
- Search Food
- Filter by Tags
- View Food Details

### Customer
- Login
- Logout
- Browse Food Items
- Search Food
- Filter by Tags
- View Food Details
- Add to Cart
- View Cart
- Update Cart Item Quantity
- Remove from Cart
- Place Order
- Proceed to Checkout
- Make Payment
- Track Order

### Admin
- Login
- Logout
- (Additional admin use cases can be added as system evolves)

