/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

/**
 * Supported timezones in IANA format.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supportedTimezones".
 */
export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Brisbane'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji';

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  blocks: {};
  collections: {
    users: User;
    customers: Customer;
    areas: Area;
    blocks: Block;
    trips: Trip;
    employee: Employee;
    transaction: Transaction;
    invoice: Invoice;
    media: Media;
    reports: Report;
    expenses: Expense;
    messages: Message;
    requests: Request;
    'payload-jobs': PayloadJob;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
    'payload-query-presets': PayloadQueryPreset;
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
      transactions: 'transaction';
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
    media: MediaSelect<false> | MediaSelect<true>;
    reports: ReportsSelect<false> | ReportsSelect<true>;
    expenses: ExpensesSelect<false> | ExpensesSelect<true>;
    messages: MessagesSelect<false> | MessagesSelect<true>;
    requests: RequestsSelect<false> | RequestsSelect<true>;
    'payload-jobs': PayloadJobsSelect<false> | PayloadJobsSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
    'payload-query-presets': PayloadQueryPresetsSelect<false> | PayloadQueryPresetsSelect<true>;
  };
  db: {
    defaultIDType: string;
  };
  globals: {
    company: Company;
  };
  globalsSelect: {
    company: CompanySelect<false> | CompanySelect<true>;
  };
  locale: null;
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: {
      sendEmail: TaskSendEmail;
      inline: {
        input: unknown;
        output: unknown;
      };
    };
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
  fullName?: string | null;
  roles: ('admin' | 'editor')[];
  updatedAt: string;
  createdAt: string;
  enableAPIKey?: boolean | null;
  apiKey?: string | null;
  apiKeyIndex?: string | null;
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
  lastDelivered?: number | null;
  name: string;
  email?: string | null;
  address?: string | null;
  area: string | Area;
  block: string | Block;
  rate: number;
  balance?: number | null;
  advance?: number | null;
  status: 'active' | 'archive';
  bottlesAtHome?: number | null;
  deliveryFrequencyDays?: number | null;
  contactNumbers?:
    | {
        type?: 'whatsapp' | null;
        contactNumber: string;
        id?: string | null;
      }[]
    | null;
  transaction?: {
    docs?: (string | Transaction)[];
    hasNextPage?: boolean;
    totalDocs?: number;
  };
  invoice?: {
    docs?: (string | Invoice)[];
    hasNextPage?: boolean;
    totalDocs?: number;
  };
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
    docs?: (string | Block)[];
    hasNextPage?: boolean;
    totalDocs?: number;
  };
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
    docs?: (string | Customer)[];
    hasNextPage?: boolean;
    totalDocs?: number;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "transaction".
 */
export interface Transaction {
  id: string;
  trip?: (string | null) | Trip;
  customer: string | Customer;
  lastDelivered?: number | null;
  status: 'paid' | 'unpaid' | 'pending';
  bottleGiven: number;
  bottleTaken: number;
  /**
   * Bottles at home/office, calculates automaticly based on last transaction
   */
  remainingBottles?: number | null;
  transactionAt: string;
  total: number;
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
  areas: (string | Area)[];
  blocks?: (string | Block)[] | null;
  bottles: number;
  tripAt: string;
  employee: (string | Employee)[];
  /**
   * Set the status to In Progress or Complete.
   */
  status: 'inprogress' | 'complete';
  transactions?: {
    docs?: (string | Transaction)[];
    hasNextPage?: boolean;
    totalDocs?: number;
  };
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
  nic?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "invoice".
 */
export interface Invoice {
  id: string;
  isLatest?: boolean | null;
  customer: string | Customer;
  transactions: (string | Transaction)[];
  status?: ('paid' | 'unpaid' | 'partially-paid') | null;
  netTotal?: number | null;
  /**
   * This field calculates automaticly based on previous invoice and you should add previous balance only in first invoice. ( Previous months balance which customer needs to pay )
   */
  previousBalance?: number | null;
  /**
   * Customer paid more then invoice amount in previous month which will be adjust on this invoice.
   */
  previousAdvanceAmount?: number | null;
  dueAmount?: number | null;
  paidAmount?: number | null;
  /**
   * Customer paid more then invoice amount which will be adjust on next billig/invoice.
   */
  advanceAmount?: number | null;
  /**
   * Customer needs to pay this amount to clear billig/invoice.
   */
  remainingAmount?: number | null;
  paidAt?: string | null;
  dueAt: string;
  sent?: boolean | null;
  payments?:
    | {
        type?: ('online' | 'cash') | null;
        amount: number;
        paidAt: string;
        /**
         * Anything speacial that you want to mention?
         */
        comments?: string | null;
        id?: string | null;
      }[]
    | null;
  lostBottlesCount?: number | null;
  lostBottleAmount?: number | null;
  lostBottlesTotalAmount?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: string;
  alt: string;
  _key?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "reports".
 */
export interface Report {
  id: string;
  month?: string | null;
  totalCollection?: string | null;
  totalExpenses?: string | null;
  totalBottlesDelivered?: number | null;
  totalExpectedIncome?: string | null;
  /**
   * Needs to recover overall due amount
   */
  totalDueAmount?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "expenses".
 */
export interface Expense {
  id: string;
  /**
   * Describe the expense (for example): Petrol for Trip at Bahria Town, Driver Salary, Bahria Town Gate Pass Fee
   */
  title: string;
  type:
    | 'daily_miscellaneous'
    | 'fuel'
    | 'salary'
    | 'plant-accessories'
    | 'rent'
    | 'utility_bills'
    | 'laboratory'
    | 'gate_pass'
    | 'maintenance_plant'
    | 'maintenance_vehicle'
    | 'minerals'
    | 'bottles'
    | 'psqca';
  expenseAt: string;
  /**
   * Amount that you spent
   */
  amount: number;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "messages".
 */
export interface Message {
  id: string;
  from?: (string | Customer)[] | null;
  read?: boolean | null;
  messages: {
    fullMessage?:
      | {
          [k: string]: unknown;
        }
      | unknown[]
      | string
      | number
      | boolean
      | null;
    id?: string | null;
  }[];
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "requests".
 */
export interface Request {
  id: string;
  from?: (string | Customer)[] | null;
  phone?: string | null;
  date: string;
  fulfilled?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-jobs".
 */
export interface PayloadJob {
  id: string;
  /**
   * Input data provided to the job
   */
  input?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  taskStatus?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  completedAt?: string | null;
  totalTried?: number | null;
  /**
   * If hasError is true this job will not be retried
   */
  hasError?: boolean | null;
  /**
   * If hasError is true, this is the error that caused it
   */
  error?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  /**
   * Task execution log
   */
  log?:
    | {
        executedAt: string;
        completedAt: string;
        taskSlug: 'inline' | 'sendEmail';
        taskID: string;
        input?:
          | {
              [k: string]: unknown;
            }
          | unknown[]
          | string
          | number
          | boolean
          | null;
        output?:
          | {
              [k: string]: unknown;
            }
          | unknown[]
          | string
          | number
          | boolean
          | null;
        state: 'failed' | 'succeeded';
        error?:
          | {
              [k: string]: unknown;
            }
          | unknown[]
          | string
          | number
          | boolean
          | null;
        id?: string | null;
      }[]
    | null;
  taskSlug?: ('inline' | 'sendEmail') | null;
  queue?: string | null;
  waitUntil?: string | null;
  processing?: boolean | null;
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
      } | null)
    | ({
        relationTo: 'media';
        value: string | Media;
      } | null)
    | ({
        relationTo: 'reports';
        value: string | Report;
      } | null)
    | ({
        relationTo: 'expenses';
        value: string | Expense;
      } | null)
    | ({
        relationTo: 'messages';
        value: string | Message;
      } | null)
    | ({
        relationTo: 'requests';
        value: string | Request;
      } | null)
    | ({
        relationTo: 'payload-jobs';
        value: string | PayloadJob;
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
 * via the `definition` "payload-query-presets".
 */
export interface PayloadQueryPreset {
  id: string;
  title: string;
  isShared?: boolean | null;
  access?: {
    read?: {
      constraint?: ('everyone' | 'onlyMe' | 'specificUsers') | null;
      users?: (string | User)[] | null;
    };
    update?: {
      constraint?: ('everyone' | 'onlyMe' | 'specificUsers') | null;
      users?: (string | User)[] | null;
    };
    delete?: {
      constraint?: ('everyone' | 'onlyMe' | 'specificUsers') | null;
      users?: (string | User)[] | null;
    };
  };
  where?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  columns?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  relatedCollection: 'customers' | 'trips' | 'transaction' | 'invoice' | 'expenses';
  /**
   * This is a tempoary field used to determine if updating the preset would remove the user's access to it. When `true`, this record will be deleted after running the preset's `validate` function.
   */
  isTemp?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  fullName?: T;
  roles?: T;
  updatedAt?: T;
  createdAt?: T;
  enableAPIKey?: T;
  apiKey?: T;
  apiKeyIndex?: T;
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
  lastDelivered?: T;
  name?: T;
  email?: T;
  address?: T;
  area?: T;
  block?: T;
  rate?: T;
  balance?: T;
  advance?: T;
  status?: T;
  bottlesAtHome?: T;
  deliveryFrequencyDays?: T;
  contactNumbers?:
    | T
    | {
        type?: T;
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
  areas?: T;
  blocks?: T;
  bottles?: T;
  tripAt?: T;
  employee?: T;
  status?: T;
  transactions?: T;
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
  lastDelivered?: T;
  status?: T;
  bottleGiven?: T;
  bottleTaken?: T;
  remainingBottles?: T;
  transactionAt?: T;
  total?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "invoice_select".
 */
export interface InvoiceSelect<T extends boolean = true> {
  isLatest?: T;
  customer?: T;
  transactions?: T;
  status?: T;
  netTotal?: T;
  previousBalance?: T;
  previousAdvanceAmount?: T;
  dueAmount?: T;
  paidAmount?: T;
  advanceAmount?: T;
  remainingAmount?: T;
  paidAt?: T;
  dueAt?: T;
  sent?: T;
  payments?:
    | T
    | {
        type?: T;
        amount?: T;
        paidAt?: T;
        comments?: T;
        id?: T;
      };
  lostBottlesCount?: T;
  lostBottleAmount?: T;
  lostBottlesTotalAmount?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  _key?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "reports_select".
 */
export interface ReportsSelect<T extends boolean = true> {
  month?: T;
  totalCollection?: T;
  totalExpenses?: T;
  totalBottlesDelivered?: T;
  totalExpectedIncome?: T;
  totalDueAmount?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "expenses_select".
 */
export interface ExpensesSelect<T extends boolean = true> {
  title?: T;
  type?: T;
  expenseAt?: T;
  amount?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "messages_select".
 */
export interface MessagesSelect<T extends boolean = true> {
  from?: T;
  read?: T;
  messages?:
    | T
    | {
        fullMessage?: T;
        id?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "requests_select".
 */
export interface RequestsSelect<T extends boolean = true> {
  from?: T;
  phone?: T;
  date?: T;
  fulfilled?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-jobs_select".
 */
export interface PayloadJobsSelect<T extends boolean = true> {
  input?: T;
  taskStatus?: T;
  completedAt?: T;
  totalTried?: T;
  hasError?: T;
  error?: T;
  log?:
    | T
    | {
        executedAt?: T;
        completedAt?: T;
        taskSlug?: T;
        taskID?: T;
        input?: T;
        output?: T;
        state?: T;
        error?: T;
        id?: T;
      };
  taskSlug?: T;
  queue?: T;
  waitUntil?: T;
  processing?: T;
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
 * via the `definition` "payload-query-presets_select".
 */
export interface PayloadQueryPresetsSelect<T extends boolean = true> {
  title?: T;
  isShared?: T;
  access?:
    | T
    | {
        read?:
          | T
          | {
              constraint?: T;
              users?: T;
            };
        update?:
          | T
          | {
              constraint?: T;
              users?: T;
            };
        delete?:
          | T
          | {
              constraint?: T;
              users?: T;
            };
      };
  where?: T;
  columns?: T;
  relatedCollection?: T;
  isTemp?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "company".
 */
export interface Company {
  id: string;
  logo?: (string | null) | Media;
  name: string;
  address?: string | null;
  contactNumbers?:
    | {
        type?: 'whatsapp' | null;
        contactNumber: string;
        id?: string | null;
      }[]
    | null;
  paymentMethods?:
    | {
        name?: string | null;
        accountTitle?: string | null;
        accountNo?: string | null;
        accountIBAN?: string | null;
        id?: string | null;
      }[]
    | null;
  invoiceMessage?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "company_select".
 */
export interface CompanySelect<T extends boolean = true> {
  logo?: T;
  name?: T;
  address?: T;
  contactNumbers?:
    | T
    | {
        type?: T;
        contactNumber?: T;
        id?: T;
      };
  paymentMethods?:
    | T
    | {
        name?: T;
        accountTitle?: T;
        accountNo?: T;
        accountIBAN?: T;
        id?: T;
      };
  invoiceMessage?: T;
  updatedAt?: T;
  createdAt?: T;
  globalType?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "TaskSendEmail".
 */
export interface TaskSendEmail {
  input: {
    to: string;
    subject: string;
    templateName: string;
    data?:
      | {
          [k: string]: unknown;
        }
      | unknown[]
      | string
      | number
      | boolean
      | null;
  };
  output?: unknown;
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