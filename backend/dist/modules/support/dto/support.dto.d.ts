export declare class CreateTicketDto {
    title: string;
    description: string;
    category_id: string;
    priority_id: string;
    tags?: string[];
    metadata?: string;
}
export declare class UpdateTicketDto {
    title?: string;
    description?: string;
    category_id?: string;
    priority_id?: string;
    status_id?: string;
    assigned_to?: string;
    tags?: string[];
    metadata?: string;
}
export declare class CreateTicketMessageDto {
    message: string;
    metadata?: string;
}
export declare class UpdateTicketMessageDto {
    message?: string;
    metadata?: string;
}
export declare class CreateTicketRatingDto {
    rating: number;
    comment?: string;
}
export declare class GetTicketsDto {
    category_id?: string;
    priority_id?: string;
    status_id?: string;
    assigned_to?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class CreateCategoryDto {
    name: string;
    description?: string;
    color?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    description?: string;
    color?: string;
}
export declare class CreatePriorityDto {
    name: string;
    description?: string;
    color?: string;
    level?: number;
    sla_hours?: number;
}
export declare class UpdatePriorityDto {
    name?: string;
    description?: string;
    color?: string;
    level?: number;
    sla_hours?: number;
}
