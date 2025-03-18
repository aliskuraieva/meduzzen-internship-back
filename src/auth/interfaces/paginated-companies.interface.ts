import { Company } from "src/company/entities/company.entity";

export interface PaginatedCompanies {
    companies: Company[];
    total: number;
    page: number;
    pageSize: number;
}
