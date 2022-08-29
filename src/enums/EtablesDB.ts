enum AdminCol {
    id = 'id',
    name = 'name',
    lastname = 'lastname',
    email = 'email',
    user = 'user',
    tel = 'tel'
}

enum AuthAdmCol {
    id = 'id',
    user = 'user',
    pass = 'pass',
    prov = 'prov'
}

enum UserPermissionCol {
    id = "id",
    id_user = "id_user",
    id_permission = "id_permission"
}

enum Permissions {
    id = "id",
    module_name = "module_name"
}

enum Activity {
    id = "id",
    date = "date",
    user_id = "user_id",
    activity_descr = "activity_descr"
}

enum Providers {
    id_provider = "id_provider",
    name = "name",
    sector_id = "sector_id",
    dni = "dni",
    cuit = "cuit",
    direction = "direction",
    prof_numb = "prof_numb",
    is_professional = "is_professional",
    is_health_prof = "is_health_prof",
    hours = "hours",
    month_amount = "month_amount",
    amount_id = "amount_id",
    category = "category",
    activity = "activity",
    email = "email",
    phone = "phone",
    created = "created",
    updated = "updated"
}

enum Sectors {
    id = "id",
    sector = "sector",
    description = "description"
}

enum Amounts {
    id = "id",
    amount_name = "amount_name",
    amount = "amount",
    per_hour = "per_hour",
    description = "description"
}

enum Works {
    id_work = "id_work",
    id_provider = "id_provider",
    hours = "hours",
    price_hour = "price_hour",
    amount = "amount",
    extra = "extra",
    month = "month",
    year = "year",
    details = "details",
    id_contract = "id_contract"
}

enum Contracts {
    id_contract = "id_contract",
    id_prov = "id_prov",
    from_contract = "from_contract",
    to_contract = "to_contract",
    created = "created"
}

enum Payments {
    id_payment = "id_payment",
    pv = "pv",
    number = "number",
    id_provider = "id_provider",
    dni = "dni",
    total = "total",
    details = "details",
    type = "type",
    date = "date",
    advance = "advance",
    month = "month",
    year = "year"
}

enum DetPayments {
    id = "id",
    month = "month",
    year = "year",
    amount = "amount",
    payment_id = "payment_id",
    id_provider = "id_provider",
    advance = "advance"
}

export enum EPermissions {
    userAdmin = 1,
    providers = 2,
    payments = 3,
    reports = 4,
    works = 5
}

export enum Tables {
    ADMIN = "admins",
    AUTH_ADMIN = "auth_admin",
    USER_PERMISSIONS = "admin_permissions",
    PERMISSIONS = "permissions",
    ACTIVITY = "activity",
    PROVIDERS = "providers",
    SECTORS = "sectors",
    AMOUNTS = "amounts",
    WORKS = "works",
    CONTRACTS = "contracts",
    PAYMENTS = "payments",
    PAYMENT_DETAILS = "payment_details"
}

export const Columns = {
    admin: AdminCol,
    authAdmin: AuthAdmCol,
    userPermissions: UserPermissionCol,
    permissions: Permissions,
    activity: Activity,
    providers: Providers,
    sectors: Sectors,
    amounts: Amounts,
    works: Works,
    contracts: Contracts,
    payments: Payments,
    payment_details: DetPayments
}