/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  collections: {
    users: User;
    customers: Customer;
    areas: Area;
    blocks: Block;
    trips: Trip;
    employee: Employee;
    transaction: Transaction;
    invoice: Invoice;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {
    customers: {
      transaction: 'transaction';
      invoice: 'invoice';
    };
    areas: {
      block: 'blocks';
    };
    blocks: {
      customers: 'customers';
    };
    trips: {
      transaction: 'transaction';
    };
  };
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>;
    customers: CustomersSelect<false> | CustomersSelect<true>;
    areas: AreasSelect<false> | AreasSelect<true>;
    blocks: BlocksSelect<false> | BlocksSelect<true>;
    trips: TripsSelect<false> | TripsSelect<true>;
    employee: EmployeeSelect<false> | EmployeeSelect<true>;
    transaction: TransactionSelect<false> | TransactionSelect<true>;
    invoice: InvoiceSelect<false> | InvoiceSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: string;
  };
  globals: {};
  globalsSelect: {};
  locale: null;
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "customers".
 */
export interface Customer {
  id: string;
  name: string;
  address?: string | null;
  area: string | Area;
  block: string | Block;
  rate: number;
  balance?: number | null;
  advance?: number | null;
  status: 'active' | 'archive';
  bottlesAtHome?: number | null;
  contactNumbers?:
    | {
        contactNumber: string;
        id?: string | null;
      }[]
    | null;
  transaction?: {
    docs?: (string | Transaction)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  invoice?: {
    docs?: (string | Invoice)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "areas".
 */
export interface Area {
  id: string;
  name: string;
  block?: {
    docs?: (string | Block)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "blocks".
 */
export interface Block {
  id: string;
  name: string;
  area: string | Area;
  customers?: {
    docs?: (string | Customer)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "transaction".
 */
export interface Transaction {
  id: string;
  trip: string | Trip;
  customer: string | Customer;
  status: 'paid' | 'unpaid' | 'pending';
  bottleGiven: number;
  bottleTaken: number;
  transactionAt: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "trips".
 */
export interface Trip {
  id: string;
  from: string;
  area: string | Area;
  bottles: number;
  tripAt: string;
  employee: (string | Employee)[];
  status: 'inprogress' | 'complete';
  transaction?: {
    docs?: (string | Transaction)[] | null;
    hasNextPage?: boolean | null;
  } | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "employee".
 */
export interface Employee {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  nic: string;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "invoice".
 */
export interface Invoice {
  id: string;
  customer: string | Customer;
  transaction: (string | Transaction)[];
  status: 'paid' | 'unpaid' | 'partially-paid';
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: string;
  document?:
    | ({
        relationTo: 'users';
        value: string | User;
      } | null)
    | ({
        relationTo: 'customers';
        value: string | Customer;
      } | null)
    | ({
        relationTo: 'areas';
        value: string | Area;
      } | null)
    | ({
        relationTo: 'blocks';
        value: string | Block;
      } | null)
    | ({
        relationTo: 'trips';
        value: string | Trip;
      } | null)
    | ({
        relationTo: 'employee';
        value: string | Employee;
      } | null)
    | ({
        relationTo: 'transaction';
        value: string | Transaction;
      } | null)
    | ({
        relationTo: 'invoice';
        value: string | Invoice;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "customers_select".
 */
export interface CustomersSelect<T extends boolean = true> {
  name?: T;
  address?: T;
  area?: T;
  block?: T;
  rate?: T;
  balance?: T;
  advance?: T;
  status?: T;
  bottlesAtHome?: T;
  contactNumbers?:
    | T
    | {
        contactNumber?: T;
        id?: T;
      };
  transaction?: T;
  invoice?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "areas_select".
 */
export interface AreasSelect<T extends boolean = true> {
  name?: T;
  block?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "blocks_select".
 */
export interface BlocksSelect<T extends boolean = true> {
  name?: T;
  area?: T;
  customers?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "trips_select".
 */
export interface TripsSelect<T extends boolean = true> {
  from?: T;
  area?: T;
  bottles?: T;
  tripAt?: T;
  employee?: T;
  status?: T;
  transaction?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "employee_select".
 */
export interface EmployeeSelect<T extends boolean = true> {
  name?: T;
  address?: T;
  contactNumber?: T;
  nic?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "transaction_select".
 */
export interface TransactionSelect<T extends boolean = true> {
  trip?: T;
  customer?: T;
  status?: T;
  bottleGiven?: T;
  bottleTaken?: T;
  transactionAt?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "invoice_select".
 */
export interface InvoiceSelect<T extends boolean = true> {
  customer?: T;
  transaction?: T;
  status?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}