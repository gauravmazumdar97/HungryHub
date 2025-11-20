# UML Class Diagram - Food Ordering Application

## Overview
This document describes the Class Diagrams for the Food Ordering Application, covering both Frontend (Angular) and Backend (Node.js/Express) components.

---

## Backend Class Diagram

### Models

#### User Model
```
┌─────────────────────────────────┐
│         User (Interface)        │
├─────────────────────────────────┤
│ + id: string                    │
│ + email: string                 │
│ + password: string              │
│ + name: string                  │
│ + address: string               │
│ + isAdmin: boolean              │
└─────────────────────────────────┘
```

#### UserSchema (Mongoose Schema)
```
┌─────────────────────────────────┐
│      UserSchema (Schema)        │
├─────────────────────────────────┤
│ + name: String (required)       │
│ + email: String (required,     │
│            unique)              │
│ + password: String (required)  │
│ + address: String (required)    │
│ + isAdmin: Boolean (required)  │
│ + timestamps: true              │
└─────────────────────────────────┘
```

#### Food Model
```
┌─────────────────────────────────┐
│        Food (Interface)         │
├─────────────────────────────────┤
│ + id: string                    │
│ + name: string                  │
│ + price: number                 │
│ + tags: string[]                │
│ + favorite: boolean             │
│ + imageUrl: string              │
│ + origins: string[]             │
│ + cookTime: string              │
└─────────────────────────────────┘
```

#### FoodSchema (Mongoose Schema)
```
┌─────────────────────────────────┐
│     FoodSchema (Schema)         │
├─────────────────────────────────┤
│ + name: String (required)      │
│ + price: Number (required)      │
│ + tags: [String]                │
│ + favorite: Boolean (default:   │
│            false)                │
│ + imageUrl: String (required)   │
│ + origins: [String] (required)  │
│ + cookTime: String (required)   │
│ + timestamps: true              │
└─────────────────────────────────┘
```

### Routers

#### UserRouter
```
┌─────────────────────────────────┐
│         UserRouter               │
├─────────────────────────────────┤
│ + router: Router                │
├─────────────────────────────────┤
│ + get("/seed"): void            │
│ + post("/login"): User          │
│ + post("/register"): User       │
│ - generateTokenResponse(        │
│     user: User): User           │
└─────────────────────────────────┘
```

#### FoodRouter
```
┌─────────────────────────────────┐
│         FoodRouter               │
├─────────────────────────────────┤
│ + router: Router                │
├─────────────────────────────────┤
│ + get("/seed"): void            │
│ + get("/"): Food[]              │
│ + get("/search/:searchTerm"):   │
│     Food[]                      │
│ + get("/tags"): Tag[]           │
│ + get("/tag/:tagName"): Food[]  │
│ + get("/:foodId"): Food         │
└─────────────────────────────────┘
```

#### OrderRouter
```
┌─────────────────────────────────┐
│         OrderRouter              │
├─────────────────────────────────┤
│ + router: Router                │
├─────────────────────────────────┤
│ + post("/create"): Order        │
│ + get("/newOrderForCurrentUser"):│
│     Order                       │
│ + post("/pay"): string          │
│ + get("/track/:id"): Order      │
│ - getNewOrderForCurrentUser(    │
│     req: any): Order            │
└─────────────────────────────────┘
```

### Server
```
┌─────────────────────────────────┐
│            Server               │
├─────────────────────────────────┤
│ + app: Express                  │
├─────────────────────────────────┤
│ + use("/api/foods", foodRouter) │
│ + use("/api/users", userRouter) │
│ + listen(port: number): void    │
└─────────────────────────────────┘
```

---

## Frontend Class Diagram

### Models

#### User
```
┌─────────────────────────────────┐
│            User                  │
├─────────────────────────────────┤
│ + id: string                     │
│ + email: string                  │
│ + name: string                   │
│ + address: string                │
│ + token: string                  │
│ + isAdmin: boolean               │
└─────────────────────────────────┘
```

#### Food
```
┌─────────────────────────────────┐
│            Food                  │
├─────────────────────────────────┤
│ + id: string                     │
│ + name: string                   │
│ + price: number                  │
│ + tags?: string[]                │
│ + stars: number                  │
│ + imageUrl: string               │
│ + origins: string[]              │
│ + cookTime: string               │
└─────────────────────────────────┘
```

#### CartItem
```
┌─────────────────────────────────┐
│          CartItem                │
├─────────────────────────────────┤
│ + food: Food                     │
│ + quantity: number               │
│ + price: number                  │
├─────────────────────────────────┤
│ + constructor(food: Food)        │
└─────────────────────────────────┘
```

#### Cart
```
┌─────────────────────────────────┐
│            Cart                  │
├─────────────────────────────────┤
│ + items: CartItem[]              │
│ + totalPrice: number             │
│ + totalCount: number             │
└─────────────────────────────────┘
```

#### Order
```
┌─────────────────────────────────┐
│            Order                 │
├─────────────────────────────────┤
│ + id: number                     │
│ + items: CartItem[]              │
│ + totalPrice: number             │
│ + name: string                   │
│ + address: string                │
│ + addressLatLng?: LatLng         │
│ + paymentId: string              │
│ + createdAt: string              │
│ + status: string                 │
└─────────────────────────────────┘
```

#### Tag
```
┌─────────────────────────────────┐
│            Tag                   │
├─────────────────────────────────┤
│ + name: string                   │
│ + count: number                  │
└─────────────────────────────────┘
```

### Services

#### UserService
```
┌─────────────────────────────────┐
│         UserService              │
├─────────────────────────────────┤
│ - userSubject: BehaviorSubject  │
│   <User>                        │
│ + userObservable: Observable    │
│   <User>                        │
├─────────────────────────────────┤
│ + get currentUser(): User        │
│ + login(userLogin: IUserLogin):  │
│     Observable<User>            │
│ + register(userRegister:         │
│     IUserRegister): Observable  │
│     <User>                      │
│ + logout(): void                │
│ - setUserToLocalStorage(        │
│     user: User): void           │
│ - getUserFromLocalStorage():     │
│     User                        │
└─────────────────────────────────┘
```

#### FoodService
```
┌─────────────────────────────────┐
│         FoodService              │
├─────────────────────────────────┤
│ - http: HttpClient              │
├─────────────────────────────────┤
│ + getAll(): Observable<Food[]>   │
│ + getAllFoodBySearchItem(       │
│     searchTerm: string):        │
│     Observable<Food[]>          │
│ + getAllTags(): Observable      │
│     <Tag[]>                     │
│ + getAllFoodsByTag(tag: string):│
│     Observable<Food[]>          │
│ + getFoodById(foodId: string):  │
│     Observable<Food>            │
└─────────────────────────────────┘
```

#### CartService
```
┌─────────────────────────────────┐
│         CartService              │
├─────────────────────────────────┤
│ - cart: Cart                    │
│ - cartSubject: BehaviorSubject  │
│   <Cart>                        │
├─────────────────────────────────┤
│ + addToCart(food: Food): void   │
│ + removeFromCart(foodId:        │
│     string): void                │
│ + changeQuantity(foodId: string,│
│     quantity: number): void     │
│ + clearCart(): void             │
│ + getCart(): Cart               │
│ + getCartObservable():          │
│     Observable<Cart>             │
│ - setCartToLocalStorage(): void │
│ - getCartFromLocalStorage():    │
│     Cart                        │
└─────────────────────────────────┘
```

#### OrderService
```
┌─────────────────────────────────┐
│         OrderService             │
├─────────────────────────────────┤
│ - http: HttpClient              │
├─────────────────────────────────┤
│ + create(order: Order):         │
│     Observable<Order>           │
└─────────────────────────────────┘
```

### Components (Key Pages)

#### HomeComponent
```
┌─────────────────────────────────┐
│        HomeComponent             │
├─────────────────────────────────┤
│ - foodService: FoodService      │
│ - activatedRoute: ActivatedRoute │
│ + foods: Food[]                 │
├─────────────────────────────────┤
│ + ngOnInit(): void              │
└─────────────────────────────────┘
```

#### FoodPageComponent
```
┌─────────────────────────────────┐
│      FoodPageComponent           │
├─────────────────────────────────┤
│ - foodService: FoodService      │
│ - cartService: CartService      │
│ - activatedRoute: ActivatedRoute│
│ + food: Food                    │
├─────────────────────────────────┤
│ + ngOnInit(): void              │
│ + addToCart(): void             │
└─────────────────────────────────┘
```

#### CartPageComponent
```
┌─────────────────────────────────┐
│       CartPageComponent          │
├─────────────────────────────────┤
│ - cartService: CartService      │
│ + cart: Cart                    │
├─────────────────────────────────┤
│ + ngOnInit(): void              │
│ + removeFromCart(foodId:        │
│     string): void                │
│ + changeQuantity(foodId: string,│
│     quantity: number): void     │
└─────────────────────────────────┘
```

#### LoginPageComponent
```
┌─────────────────────────────────┐
│      LoginPageComponent          │
├─────────────────────────────────┤
│ - userService: UserService      │
│ - formBuilder: FormBuilder      │
│ + loginForm: FormGroup          │
│ + isSubmitted: boolean          │
├─────────────────────────────────┤
│ + ngOnInit(): void              │
│ + submit(): void                │
│ + get fc(): AbstractControl     │
└─────────────────────────────────┘
```

#### RegisterPageComponent
```
┌─────────────────────────────────┐
│    RegisterPageComponent         │
├─────────────────────────────────┤
│ - userService: UserService      │
│ - formBuilder: FormBuilder      │
│ + registerForm: FormGroup       │
│ + isSubmitted: boolean          │
├─────────────────────────────────┤
│ + ngOnInit(): void              │
│ + submit(): void                │
│ + get fc(): AbstractControl     │
└─────────────────────────────────┘
```

#### CheckoutPageComponent
```
┌─────────────────────────────────┐
│     CheckoutPageComponent        │
├─────────────────────────────────┤
│ - cartService: CartService      │
│ - userService: UserService      │
│ - orderService: OrderService    │
│ + cart: Cart                    │
│ + user: User                    │
├─────────────────────────────────┤
│ + ngOnInit(): void              │
│ + createOrder(): void           │
└─────────────────────────────────┘
```

---

## Relationships

### Backend Relationships
- `UserRouter` uses `UserModel` (Mongoose Model)
- `FoodRouter` uses `FoodModel` (Mongoose Model)
- `OrderRouter` uses `OrderModel` (Mongoose Model)
- `Server` aggregates `UserRouter`, `FoodRouter`, `OrderRouter`

### Frontend Relationships
- `UserService` manages `User` model
- `FoodService` manages `Food` model
- `CartService` manages `Cart` and `CartItem` models
- `OrderService` manages `Order` model
- Components use Services to interact with models
- `Cart` contains multiple `CartItem` objects
- `CartItem` contains a `Food` object
- `Order` contains multiple `CartItem` objects

---

## Instructions for GitUML

### Option 1: Using GitUML Online Tool

1. Go to [GitUML](https://www.gituml.com/)
2. Connect your GitHub repository
3. Select the files you want to include in the diagram
4. GitUML will automatically generate class diagrams from your source code

### Option 2: Manual Creation

You can manually create class diagrams using:
- [Visual Paradigm Online](https://online.visualparadigm.com/)
- [Draw.io](https://app.diagrams.net/)
- [Lucidchart](https://www.lucidchart.com/)

Use the class structures provided above as a reference.

### Option 3: Using PlantUML

Create a `.puml` file with the class definitions and use PlantUML to generate diagrams.

---

## Files to Include for Class Diagram Generation

### Backend Files
- `backend/src/models/user.model.ts`
- `backend/src/models/food.model.ts`
- `backend/src/routers/user.router.ts`
- `backend/src/routers/food.router.ts`
- `backend/src/routers/order.router.ts`
- `backend/src/server.ts`

### Frontend Files
- `frontend/src/app/shared/models/user.ts`
- `frontend/src/app/shared/models/food.ts`
- `frontend/src/app/shared/models/carts.ts`
- `frontend/src/app/shared/models/cartsItems.ts`
- `frontend/src/app/shared/models/order.ts`
- `frontend/src/app/shared/models/tag.ts`
- `frontend/src/app/services/user.service.ts`
- `frontend/src/app/services/food.service.ts`
- `frontend/src/app/services/cart.service.ts`
- `frontend/src/app/services/order.service.ts`
- `frontend/src/app/components/pages/home/home.component.ts`
- `frontend/src/app/components/pages/food-page/food-page.component.ts`
- `frontend/src/app/components/pages/cart-page/cart-page.component.ts`
- `frontend/src/app/components/pages/login-page/login-page.component.ts`
- `frontend/src/app/components/pages/register-page/register-page.component.ts`
- `frontend/src/app/components/pages/checkout-page/checkout-page.component.ts`

