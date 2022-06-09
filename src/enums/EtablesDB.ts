enum AdminCol {
    id = 'id',
    nombre = 'nombre',
    apellido = 'apellido',
    email = 'email',
    usuario = 'usuario',
    telefono = 'telefono'
}

enum AuthAdmCol {
    id = 'id',
    usuario = 'usuario',
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

export enum EPermissions {
    userAdmin = 0
}

export enum Tables {
    ADMIN = "administradores",
    AUTH_ADMIN = "auth_admin",
    USER_PERMISSIONS = "admin_permissions",
    PERMISSIONS = "permissions",
}

export const Columns = {
    admin: AdminCol,
    authAdmin: AuthAdmCol,
    userPemissions: UserPermissionCol,
    permissions: Permissions
}