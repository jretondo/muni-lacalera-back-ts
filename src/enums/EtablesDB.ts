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

export enum EPermissions {
    userAdmin = 1,
    providers = 2,
    paymentRegister = 3,
    reports = 4
}

export enum Tables {
    ADMIN = "admins",
    AUTH_ADMIN = "auth_admin",
    USER_PERMISSIONS = "admin_permissions",
    PERMISSIONS = "permissions",
    ACTIVITY = "activity",
    PROVIDERS = "providers",
    SECTORS = "sectors",
    AMOUNTS = "amounts"
}

export const Columns = {
    admin: AdminCol,
    authAdmin: AuthAdmCol,
    userPermissions: UserPermissionCol,
    permissions: Permissions,
    activity: Activity,
    providers: Providers,
    sectors: Sectors,
    amounts: Amounts
}