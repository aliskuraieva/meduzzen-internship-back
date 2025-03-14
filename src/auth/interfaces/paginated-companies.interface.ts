import { Company } from "src/company/company.entity";

export interface PaginatedCompanies {
    companies: Company[];
    total: number;
    page: number;
    pageSize: number;
}
